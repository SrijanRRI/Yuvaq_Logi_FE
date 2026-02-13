import { useState } from "react"
import { toast } from "react-toastify"
import { FileText, X, Upload, IndianRupee, Truck, AlertCircle } from "lucide-react"
import axios from "axios"
import API from "../API"

const QuotationModal = ({ tender, onClose, onSuccess }) => {
  const [price, setPrice] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    const n = Number(price);
    const min = tender?.minBidAmount != null ? Number(tender.minBidAmount) : null;
    const max = tender?.maxBidAmount != null ? Number(tender.maxBidAmount) : null;

    if (!Number.isFinite(n) || n <= 0) {
      newErrors.price = "Please enter a valid price";
    } else if (min != null && n < min) {
      newErrors.price = `Bid must be at least ₹${min.toLocaleString("en-IN")}${tender?.maxBidUnit ? ` (${tender.maxBidUnit})` : ""}`;
    } else if (max != null && n > max) {
      newErrors.price = `Bid must be at most ₹${max.toLocaleString("en-IN")}${tender?.maxBidUnit ? ` (${tender.maxBidUnit})` : ""}`;
    }


    if (!vehicleNo) {
      newErrors.vehicleNo = "Vehicle number is required"
    }

    setErrors(newErrors)

    // optional: toast for range errors
    if (newErrors.price) toast.error(newErrors.price);

    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && !["image/jpeg", "image/jpg"].includes(selected.type)) {
      toast.error("Only JPG and JPEG files are allowed.")
      return
    }
    setFile(selected)
    setErrors({ ...errors, file: null })
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    const formData = new FormData()
    formData.append("price", price)
    formData.append("vehicleNumber", vehicleNo)
    if (file) formData.append("file", file)

    setIsSubmitting(true)

    try {
      const res = await axios.post(`${API.SUBMIT_QUOTATION}/${tender._id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (res.data?.success) {
        toast.success("Quotation submitted successfully")
        onClose()
        setPrice("")
        setVehicleNo("")
        setFile(null)

        if (onSuccess) onSuccess()
      } else {
        toast.error(res.data.message || "Submission failed")
      }
    } catch (err) {
      console.error("Submit Error:", err);

      // Safely unwrap backend fields
      const resp = err?.response?.data || {};
      const backendMsg =
        resp?.message ||
        resp?.error ||
        resp?.err ||
        "Your quotation could not be submitted.";

      // Meta may contain numbers we can show to the user
      const meta = resp?.data || {};
      // currentL1 might be a number or an object with .price
      const l1Raw =
        typeof meta?.currentL1 === "number"
          ? meta.currentL1
          : (meta?.currentL1?.price ?? null);

      // backend may send either "minimumRequiredDifference" or "difference"
      const requiredDiff =
        (typeof meta?.minimumRequiredDifference === "number"
          ? meta.minimumRequiredDifference
          : null) ??
        (typeof meta?.difference === "number" ? meta.difference : null) ??
        (typeof tender?.priceDifference === "number"
          ? tender.priceDifference
          : Number(tender?.priceDifference) || null);

      const yourPrice = typeof meta?.yourPrice === "number" ? meta.yourPrice : Number(price) || null;

      const hasNumbers =
        typeof l1Raw === "number" && typeof requiredDiff === "number";

      const minAllowed = hasNumbers ? Math.max(0, l1Raw - requiredDiff) : null;

      // Pretty bilingual toast (EN + HI) with backend message highlighted
      const fmt = (n) =>
        typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "-";

      toast.error(
        <div className="space-y-2">
          <div className="font-bold text-red-800">Bid Rejected • बोली अस्वीकृत</div>

          {/* Show the backend's message exactly as returned */}
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">
            {backendMsg}
          </div>

          {/* Helpful numbers if present */}
          {hasNumbers && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm">
              <div className="font-medium text-red-800 mb-1">Rule • नियम</div>
              <div className="text-red-700">
                Your price must be ≤ <b>{fmt(minAllowed)}</b> (L1 {fmt(l1Raw)} − required difference {fmt(requiredDiff)}).
              </div>
              <div className="text-red-700">
                आपकी बोली ≤ <b>{fmt(minAllowed)}</b> होनी चाहिए (L1 {fmt(l1Raw)} − आवश्यक अंतर {fmt(requiredDiff)}).
              </div>
              {typeof yourPrice === "number" && (
                <div className="mt-1 text-red-700">
                  Your price / आपकी बोली: <b>{fmt(yourPrice)}</b>
                </div>
              )}
            </div>
          )}
        </div>,
        { icon: "⚠️" }
      );
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Submit Quotation</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span>Price (₹) / मूल्य (₹)</span>
              </div>
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={price}
              min={tender?.minBidAmount ?? undefined}
              max={tender?.maxBidAmount ?? undefined}
              step="1"
              onChange={(e) => {
                setPrice(e.target.value)
                if (errors.price) setErrors({ ...errors, price: null })
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.price ? "border-red-300 bg-red-50" : "border-slate-300"
                }`}
              placeholder={`Enter your bid (Min ${tender?.minBidAmount ? `₹${Number(tender.minBidAmount).toLocaleString("en-IN")}` : "-"} • Max ${tender?.maxBidAmount ? `₹${Number(tender.maxBidAmount).toLocaleString("en-IN")}` : "-"})`}
            // placeholder={`Enter your bid amount `}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span> Vehicle Details / वाहन की सूचना / प्रति आइटम मूल्य विवरण सहित </span>
              </div>
            </label>
            <textarea
              value={vehicleNo}
              onChange={(e) => {
                setVehicleNo(e.target.value);
                if (errors.vehicleNo) setErrors({ ...errors, vehicleNo: null });
              }}
              className={`w-full px-4 py-4 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none ${errors.vehicleNo ? "border-red-300 bg-red-50" : "border-slate-300"
                }`}
              rows={4}
              placeholder="Enter vehicle number/details"
            />
            {errors.vehicleNo && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.vehicleNo}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Attachment (Optional) / अनुलग्नक (वैकल्पिक)</span>
              </div>
            </label>
            <div
              className={`border border-dashed rounded-lg p-4 text-center ${file ? "border-green-300 bg-green-50" : "border-slate-300 bg-slate-50"
                }`}
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 truncate max-w-[200px]">{file.name}</span>
                  <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-400" />
                  <div className="text-sm text-slate-500">
                    <label className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Click to upload
                      <input type="file" accept=".jpg,.jpeg" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p>or drag and drop</p>
                    <p className="text-xs mt-1">JPG or JPEG files only</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 flex items-center gap-2 shadow-sm disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Submit Quotation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuotationModal
