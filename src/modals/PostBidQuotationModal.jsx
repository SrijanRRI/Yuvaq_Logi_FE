import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  X,
  Upload,
  IndianRupee,
  Truck,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react";
import axios from "axios";
import API from "../API";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PostBidQuotationModal({ tender, onClose, onSuccess }) {
  const [price, setPrice] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // ✅ tenderId can come as tender.tenderId (active post-bid API) OR tender._id (full tender)
  const tenderId = useMemo(() => tender?.tenderId || tender?._id, [tender]);

  const submittedKey = useMemo(() => {
    if (!tenderId) return null;
    return `postbid_submitted_${tenderId}`;
  }, [tenderId]);

  // ✅ Persist disable state even after refresh
  useEffect(() => {
    if (!submittedKey) return;
    const already = localStorage.getItem(submittedKey) === "1";
    if (already) setSubmittedOnce(true);
  }, [submittedKey]);

  const authCfg = () => {
    const token = localStorage.getItem("session_token");
    return {
      withCredentials: true,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  };

  const validateForm = () => {
    const newErrors = {};
    const n = Number(price);

    const min = tender?.rangeMin != null ? Number(tender.rangeMin) : null;
    const max = tender?.rangeMax != null ? Number(tender.rangeMax) : null;

    if (!tenderId) newErrors.tenderId = "Tender id missing";

    if (!Number.isFinite(n) || n <= 0) newErrors.price = "Please enter a valid price";
    else if (min != null && n < min) newErrors.price = `Price must be >= ${fmt(min)}`;
    else if (max != null && n > max) newErrors.price = `Price must be <= ${fmt(max)}`;

    // if (!vehicleNo?.trim()) newErrors.vehicleNo = "Vehicle details are required";

    setErrors(newErrors);

    if (newErrors.tenderId) toast.error(newErrors.tenderId);
    if (newErrors.price) toast.error(newErrors.price);

    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!["image/jpeg", "image/jpg"].includes(selected.type)) {
      toast.error("Only JPG/JPEG allowed.");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (submittedOnce) {
      toast.info("Only one post-bid submission is allowed for this tender.");
      return;
    }

    if (!validateForm()) return;

    const fd = new FormData();
    fd.append("price", String(price));
    fd.append("vehicleNumber", vehicleNo);
    if (file) fd.append("file", file);

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API.SUBMIT_POST_BID_QUOTATION}/${tenderId}`,
        fd,
        authCfg()
      );

      if (res.data?.success) {
        toast.success(res.data?.message || "Post-bid submitted");

        // ✅ lock submissions after first success
        setSubmittedOnce(true);
        if (submittedKey) localStorage.setItem(submittedKey, "1");

        onSuccess?.(res.data);
        onClose?.();
      } else {
        toast.error(res.data?.message || "Submission failed");
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      const msg = serverMsg || "Post-bid submission failed";

      // ✅ If backend says already submitted, lock UI too
      if (
        err?.response?.status === 409 ||
        /already submitted|only one submission/i.test(String(serverMsg || ""))
      ) {
        setSubmittedOnce(true);
        if (submittedKey) localStorage.setItem(submittedKey, "1");
      }

      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minShow = tender?.rangeMin ?? 0;
  const maxShow = tender?.rangeMax ?? 0;

  const isDisabled = isSubmitting || submittedOnce;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-2">
          <h2 className="text-xl font-bold text-slate-800">Post-Bid Quotation</h2>
          <p className="text-sm text-slate-500 mt-1">
            Allowed range: <b>{fmt(minShow)} - {fmt(maxShow)}</b>
          </p>

          {/* ✅ Clear note to avoid confusion */}
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
            <Info className="w-4 h-4 text-emerald-700 mt-0.5" />
            <p className="text-sm text-emerald-800">
              <b>Note:</b> Only <b>one</b> post-bid submission is allowed for this tender.
              {submittedOnce ? (
                <span className="block mt-1 text-emerald-700">
                  ✅ You have already submitted your post-bid quotation.
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="space-y-5 mt-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Price (₹)</span>
              </div>
            </label>
            <input
              type="number"
              value={price}
              disabled={submittedOnce}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((p) => ({ ...p, price: null }));
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
                submittedOnce ? "bg-slate-100 cursor-not-allowed" : ""
              } ${errors.price ? "border-red-300 bg-red-50" : "border-slate-300"}`}
              placeholder={`Enter price (${fmt(minShow)} - ${fmt(maxShow)})`}
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
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Vehicle Details (Optional)</span>
              </div>
            </label>
            <textarea
              value={vehicleNo}
              disabled={submittedOnce}
              onChange={(e) => {
                setVehicleNo(e.target.value);
                if (errors.vehicleNo) setErrors((p) => ({ ...p, vehicleNo: null }));
              }}
              className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none ${
                submittedOnce ? "bg-slate-100 cursor-not-allowed" : ""
              } ${errors.vehicleNo ? "border-red-300 bg-red-50" : "border-slate-300"}`}
              rows={4}
              placeholder="Vehicle number/details"
            />
            {errors.vehicleNo && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.vehicleNo}
              </p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Attachment (Optional)</span>
              </div>
            </label>

            <div
              className={`border border-dashed rounded-lg p-4 text-center ${
                submittedOnce ? "opacity-60 cursor-not-allowed" : ""
              } ${file ? "border-green-300 bg-green-50" : "border-slate-300 bg-slate-50"}`}
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 truncate max-w-[200px]">
                    {file.name}
                  </span>
                  {!submittedOnce && (
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-400" />
                  <div className="text-sm text-slate-500">
                    <label
                      className={`cursor-pointer text-emerald-700 hover:text-emerald-900 ${
                        submittedOnce ? "pointer-events-none" : ""
                      }`}
                    >
                      Click to upload
                      <input
                        type="file"
                        accept=".jpg,.jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={submittedOnce}
                      />
                    </label>
                    <p className="text-xs mt-1">JPG/JPEG only</p>
                  </div>
                </div>
              )}
            </div>
          </div> */}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`px-5 py-2.5 rounded-lg text-white flex items-center gap-2 shadow-sm
              bg-gradient-to-r from-teal-500 to-emerald-600
              hover:from-teal-600 hover:to-emerald-700
              disabled:opacity-60 disabled:cursor-not-allowed`}
            title={submittedOnce ? "Already submitted" : ""}
          >
            <Upload className="w-4 h-4" />
            {submittedOnce ? "Submitted" : isSubmitting ? "Submitting..." : "Submit Post-Bid"}
          </button>
        </div>
      </div>
    </div>
  );
}