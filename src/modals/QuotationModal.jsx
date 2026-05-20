import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FileText,
  X,
  Upload,
  IndianRupee,
  Truck,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import axios from "axios";
import API from "../API";

const MAX_QUOTATION_SUBMISSIONS = 5

const QuotationModal = ({ tender, onClose, onSuccess }) => {
  const [price, setPrice] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [touched, setTouched] = useState({ price: false, vehicle: false });

  const [lastQuotedPrice, setLastQuotedPrice] = useState(null);
  const [quoteCount, setQuoteCount] = useState(0);

  // ✅ Step value from tender
  const priceStep = useMemo(() => {
    const v = Number(tender?.priceDifference);
    return Number.isFinite(v) && v > 0 ? v : 25;
  }, [tender?.priceDifference]);

  const remainingQuotes = Math.max(0, MAX_QUOTATION_SUBMISSIONS - quoteCount);
  const hasReachedQuoteLimit = quoteCount >= MAX_QUOTATION_SUBMISSIONS;

  // const validateForm = () => {
  //   const newErrors = {};

  //   const n = Number(price);
  //   const min = tender?.minBidAmount != null ? Number(tender.minBidAmount) : null;
  //   const max = tender?.maxBidAmount != null ? Number(tender.maxBidAmount) : null;

  //   if (!Number.isFinite(n) || n <= 0) {
  //     newErrors.price = "Please enter a valid price";
  //   } else if (min != null && n < min) {
  //     newErrors.price = `Bid must be at least ₹${min.toLocaleString("en-IN")}${tender?.maxBidUnit ? ` (${tender.maxBidUnit})` : ""
  //       }`;
  //   } else if (max != null && n > max) {
  //     newErrors.price = `Bid must be at most ₹${max.toLocaleString("en-IN")}${tender?.maxBidUnit ? ` (${tender.maxBidUnit})` : ""
  //       }`;
  //   } else if (
  //     lastQuotedPrice != null &&
  //     Number.isFinite(lastQuotedPrice) &&
  //     n > lastQuotedPrice
  //   ) {
  //     newErrors.price = `You cannot quote higher than your previous quoted amount ₹${lastQuotedPrice.toLocaleString(
  //       "en-IN"
  //     )}`;
  //   }

  //   setErrors(newErrors);
  //   if (newErrors.price) toast.error(newErrors.price);

  //   return Object.keys(newErrors).length === 0;
  // };

  const validateForm = () => {
    if (hasReachedQuoteLimit) {
      toast.error("You have already submitted 5 quotations for this tender.");
      return false;
    }

    const newErrors = {};

    const n = Number(price);
    const min = tender?.minBidAmount != null ? Number(tender.minBidAmount) : null;
    const max = tender?.maxBidAmount != null ? Number(tender.maxBidAmount) : null;

    if (!Number.isFinite(n) || n <= 0) {
      newErrors.price = "Please enter a valid price";
    } else if (min != null && n < min) {
      newErrors.price = `Bid must be at least ₹${min.toLocaleString("en-IN")}${tender?.maxBidUnit ? ` (${tender.maxBidUnit})` : ""
        }`;
    } else if (max != null && n > max) {
      newErrors.price = `Bid must be at most ₹${max.toLocaleString("en-IN")}${tender?.maxBidUnit ? ` (${tender.maxBidUnit})` : ""
        }`;
    } else {
      const currentL1 = tender?.currentL1 != null ? Number(tender.currentL1) : null;

      if (currentL1 != null && Number.isFinite(currentL1)) {
        const diff = currentL1 - n;

        if (n >= currentL1) {
          newErrors.price = `Your quote must be lower than current lowest quote ₹${currentL1.toLocaleString(
            "en-IN",
          )}. Minimum difference required is ₹${priceStep}.`;
        } else if (diff < priceStep) {
          newErrors.price = `Your quote must be at least ₹${priceStep.toLocaleString(
            "en-IN",
          )} lower than current lowest quote ₹${currentL1.toLocaleString("en-IN")}.`;
        }
      }

      if (
        !newErrors.price &&
        lastQuotedPrice != null &&
        Number.isFinite(lastQuotedPrice) &&
        n > lastQuotedPrice
      ) {
        newErrors.price = `You cannot quote higher than your previous quoted amount ₹${lastQuotedPrice.toLocaleString(
          "en-IN",
        )}`;
      }
    }

    setErrors(newErrors);
    if (newErrors.price) toast.error(newErrors.price);

    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && !["image/jpeg", "image/jpg"].includes(selected.type)) {
      toast.error("Only JPG and JPEG files are allowed.");
      return;
    }
    setFile(selected);
    setErrors((p) => ({ ...p, file: null }));
  };

  // ✅ +/- handler
  const adjustPrice = (dir) => {
    if (!priceStep) {
      toast.info("Price difference is not set for this tender.");
      return;
    }

    if (dir > 0 && lastQuotedPrice != null) {
      toast.info("You cannot increase price after already quoting once.");
      return;
    }

    const base = price?.trim() !== "" ? Number(price) : 0;
    if (!Number.isFinite(base)) {
      toast.info("Please enter a valid price first.");
      return;
    }

    let next = Math.max(0, Math.round(base + dir * priceStep));

    // keep within max if present (don’t force min while clicking)
    const max = tender?.maxBidAmount != null ? Number(tender.maxBidAmount) : null;
    if (max != null && Number.isFinite(max)) next = Math.min(next, max);

    if (
      lastQuotedPrice != null &&
      Number.isFinite(lastQuotedPrice) &&
      next > lastQuotedPrice
    ) {
      next = lastQuotedPrice;
    }

    setPrice(String(next));
    if (errors.price) setErrors((p) => ({ ...p, price: null }));
  };

  // useEffect(() => {
  //   let cancelled = false;

  //   const loadMyLastQuote = async () => {
  //     try {
  //       const res = await axios.get(`${API.MY_TENDER_QUOTES}/${tender._id}`, {
  //         withCredentials: true,
  //         headers: { "Content-Type": "application/json" },
  //       });

  //       // const list = res.data?.quotations || [];
  //       // // your backend sorts createdAt: 1, so last item is latest
  //       // const last = list.length ? list[list.length - 1] : null;

  //       // if (cancelled || !last) return;

  //       // if (!last) {
  //       //   setLastQuotedPrice(null);
  //       //   return;
  //       // }

  //       const list = Array.isArray(res.data?.quotations) ? res.data.quotations : [];

  //       const normalQuotes = list.filter((q) => !q.phase || q.phase === "normal");

  //       const countFromApi =
  //         typeof res.data?.submittedCount === "number"
  //           ? res.data.submittedCount
  //           : normalQuotes.length;

  //       if (cancelled) return;

  //       setQuoteCount(countFromApi);

  //       const last = normalQuotes.length ? normalQuotes[normalQuotes.length - 1] : null;

  //       if (!last) {
  //         setLastQuotedPrice(null);
  //         return;
  //       }

  //       const prevPrice =
  //         last.price != null && Number.isFinite(Number(last.price))
  //           ? Number(last.price)
  //           : null;

  //       setLastQuotedPrice(prevPrice);

  //       // Prefill only if user hasn't started typing
  //       if (!touched.price && last.price != null) setPrice(String(last.price));
  //       if (!touched.vehicle && last.vehicleNumber) setVehicleNo(String(last.vehicleNumber));
  //     } catch (e) {
  //       // ignore silently (keep empty fields)
  //       setLastQuotedPrice(null);
  //     }
  //   };

  //   if (tender?._id) loadMyLastQuote();

  //   return () => {
  //     cancelled = true;
  //   };
  //   // IMPORTANT: run when modal opens for another tender
  // }, [tender?._id]);

  useEffect(() => {
    let cancelled = false;

    const loadMyLastQuote = async () => {
      try {
        const res = await axios.get(`${API.MY_TENDER_QUOTES}/${tender._id}`, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });

        const list = Array.isArray(res.data?.quotations) ? res.data.quotations : [];

        const normalQuotes = list.filter((q) => !q.phase || q.phase === "normal");

        const countFromApi =
          typeof res.data?.submittedCount === "number"
            ? res.data.submittedCount
            : normalQuotes.length;

        if (cancelled) return;

        setQuoteCount(countFromApi);

        const last = normalQuotes.length ? normalQuotes[normalQuotes.length - 1] : null;

        if (!last) {
          setLastQuotedPrice(null);
          return;
        }

        const prevPrice =
          last.price != null && Number.isFinite(Number(last.price))
            ? Number(last.price)
            : null;

        setLastQuotedPrice(prevPrice);

        if (!touched.price && last.price != null) setPrice(String(last.price));
        if (!touched.vehicle && last.vehicleNumber) setVehicleNo(String(last.vehicleNumber));
      } catch (e) {
        if (!cancelled) {
          setLastQuotedPrice(null);
          setQuoteCount(0);
        }
      }
    };

    if (tender?._id) loadMyLastQuote();

    return () => {
      cancelled = true;
    };
  }, [tender?._id]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("price", price);

    const v = vehicleNo?.trim();
    if (v) formData.append("vehicleNumber", v);

    if (file) formData.append("file", file);

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API.SUBMIT_QUOTATION}/${tender._id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data?.success) {
        toast.success("Quotation submitted successfully");
        onClose();
        setPrice("");
        setVehicleNo("");
        setFile(null);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.data.message || "Submission failed");
      }
    } catch (err) {
      const resp = err?.response?.data || {};
      const msg =
        resp?.message ||
        resp?.error ||
        resp?.err ||
        "Your quotation could not be submitted.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minTxt =
    tender?.minBidAmount != null
      ? `Min ₹${Number(tender.minBidAmount).toLocaleString("en-IN")}`
      : null;
  const maxTxt =
    tender?.maxBidAmount != null
      ? `Max ₹${Number(tender.maxBidAmount).toLocaleString("en-IN")}`
      : null;

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
          {/* PRICE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span>Price (₹) / मूल्य (₹)</span>
              </div>
            </label>

            {/* ✅ +/- + input row */}
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => adjustPrice(-1)}
                disabled={!priceStep || hasReachedQuoteLimit}
                className="w-12 shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title={priceStep ? `Decrease by ₹${priceStep}` : "Price difference not set"}
              >
                <Minus className="w-4 h-4 text-slate-700" />
              </button>

              <input
                type="number"
                inputMode="numeric"
                value={price}
                disabled={hasReachedQuoteLimit}
                min={tender?.minBidAmount ?? undefined}
                // max={tender?.maxBidAmount ?? undefined}
                max={
                  lastQuotedPrice != null
                    ? Math.min(
                      tender?.maxBidAmount != null ? Number(tender.maxBidAmount) : Infinity,
                      Number(lastQuotedPrice)
                    )
                    : tender?.maxBidAmount ?? undefined
                }
                step="1"
                onChange={(e) => {
                  setTouched((p) => ({ ...p, price: true }));
                  setPrice(e.target.value);
                  if (errors.price) setErrors((p) => ({ ...p, price: null }));
                }}
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.price ? "border-red-300 bg-red-50" : "border-slate-300"
                  }`}
                placeholder={`Enter bid amount`}
              />

              <button
                type="button"
                onClick={() => adjustPrice(+1)}
                // disabled={!priceStep}
                disabled={!priceStep || lastQuotedPrice != null || hasReachedQuoteLimit}
                className="w-12 shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                // title={priceStep ? `Increase by ₹${priceStep}` : "Price difference not set"}
                title={
                  lastQuotedPrice != null
                    ? "You cannot increase price after already quoting"
                    : priceStep
                      ? `Increase by ₹${priceStep}`
                      : "Price difference not set"
                }
              >
                <Plus className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {/* tiny hint */}
            <p className="mt-1 text-xs text-slate-500">
              {minTxt || maxTxt ? [minTxt, maxTxt].filter(Boolean).join(" • ") : "Enter your bid amount"}
              {priceStep ? ` • Step ₹${priceStep.toLocaleString("en-IN")}` : ""}
            </p>

            {lastQuotedPrice != null && (
              <p className="mt-1 text-xs text-amber-700">
                Your previous quote was ₹{lastQuotedPrice.toLocaleString("en-IN")}. New quote must be lower.
              </p>
            )}

            <p
              className={`mt-1 text-xs ${hasReachedQuoteLimit ? "text-red-600" : "text-slate-500"
                }`}
            >
              Quotations submitted: {quoteCount}/{MAX_QUOTATION_SUBMISSIONS}
              {!hasReachedQuoteLimit ? ` • Remaining: ${remainingQuotes}` : " • Limit reached"}
            </p>

            {hasReachedQuoteLimit && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  You have reached the maximum limit of 5 quotations for this tender.
                </span>
              </div>
            )}

            {errors.price && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.price}
              </p>
            )}
          </div>

          {/* VEHICLE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Vehicle Details / वाहन की सूचना (Optional) </span>
              </div>
            </label>
            <textarea
              value={vehicleNo}
              onChange={(e) => {
                setTouched((p) => ({ ...p, vehicle: true }));
                setVehicleNo(e.target.value);
                if (errors.vehicleNo) setErrors((p) => ({ ...p, vehicleNo: null }));
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

          {/* ATTACHMENT */}
          {/* <div>
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
                      <input
                        type="file"
                        accept=".jpg,.jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p>or drag and drop</p>
                    <p className="text-xs mt-1">JPG or JPEG files only</p>
                  </div>
                </div>
              )}
            </div>
          </div> */}
        </div>

        {!!price && !touched.price && (
          <p className="mt-1 text-xs text-emerald-700">
            Prefilled from your last quotation
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || hasReachedQuoteLimit}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting...
              </>
            ) : hasReachedQuoteLimit ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Limit Reached
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
  );
};

export default QuotationModal;