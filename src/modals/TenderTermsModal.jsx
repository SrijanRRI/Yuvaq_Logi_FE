import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const TenderTermsModal = ({
  finalPricePerMt,
  totalWeightMt,
  totalRupees,
  advancePercent,
  advanceRupees,
  onCancel,
  onAgree,
  isLoading = false,

  // ✅ PROMO
  displayPercent,
  displayAdvanceRupees,
}) => {
  const [agreed, setAgreed] = useState(false);

  const pricePerMtText = useMemo(() => {
    const n = Number(finalPricePerMt);
    return Number.isFinite(n) ? n.toLocaleString("en-IN") : "-";
  }, [finalPricePerMt]);

  const weightText = useMemo(() => {
    const n = Number(totalWeightMt);
    return Number.isFinite(n) ? n.toLocaleString("en-IN") : "-";
  }, [totalWeightMt]);

  const totalText = useMemo(() => {
    const n = Number(totalRupees);
    return Number.isFinite(n) ? n.toLocaleString("en-IN") : "-";
  }, [totalRupees]);

  const advanceText = useMemo(() => {
    const n = Number(advanceRupees);
    return Number.isFinite(n) ? n.toLocaleString("en-IN") : "-";
  }, [advanceRupees]);

  const displayPercentResolved = useMemo(() => {
    const p = Number(displayPercent);
    if (Number.isFinite(p) && p >= 0) return p;

    const envP = Number(
      import.meta?.env?.VITE_FINALIZE_ADVANCE_DISPLAY_PERCENT ?? 5
    );

    return Number.isFinite(envP) && envP >= 0 ? envP : 5;
  }, [displayPercent]);

  const displayAdvanceRupeesResolved = useMemo(() => {
    const n = Number(displayAdvanceRupees);
    if (Number.isFinite(n) && n >= 0) return n;

    const tot = Number(totalRupees);
    if (!Number.isFinite(tot) || tot < 0) return null;

    const calc = (tot * displayPercentResolved) / 100;
    return Number.isFinite(calc) ? calc : null;
  }, [displayAdvanceRupees, totalRupees, displayPercentResolved]);

  const displayAdvanceText = useMemo(() => {
    const n = Number(displayAdvanceRupeesResolved);
    return Number.isFinite(n) ? n.toLocaleString("en-IN") : "-";
  }, [displayAdvanceRupeesResolved]);

  const showPromo = useMemo(() => {
    const p = Number(advancePercent);
    const a = Number(advanceRupees);

    return (
      (Number.isFinite(p) && p === 0) ||
      (Number.isFinite(a) && a === 0)
    );
  }, [advancePercent, advanceRupees]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={onCancel}
        disabled={isLoading}
      />

      <div className="relative flex w-full max-w-[95vw] sm:max-w-xl max-h-[92vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-800 p-4 sm:p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold leading-snug">
                Caution • Terms & Conditions
              </h3>

              <p className="text-white/90 text-xs sm:text-sm mt-1 leading-relaxed break-words">
                Quotation price is{" "}
                <span className="font-semibold">₹{pricePerMtText}</span> / MT.{" "}
                {showPromo ? (
                  <>
                    Regular advance{" "}
                    <span className="font-semibold">
                      {displayPercentResolved}%
                    </span>{" "}
                    is{" "}
                    <span className="font-semibold line-through opacity-80">
                      ₹{displayAdvanceText}
                    </span>{" "}
                    • <span className="font-semibold">Promo Applied: ₹0</span>
                  </>
                ) : (
                  <>
                    You will pay{" "}
                    <span className="font-semibold">{advancePercent}%</span>{" "}
                    advance now.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-700">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm">
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>
                <b>YuvaQ</b> is a technology platform for tender creation and
                bid collection.
              </li>

              <li>
                Tender details are provided by the tender creator.{" "}
                <b>YuvaQ does not verify</b> the accuracy or completeness of
                these details.
              </li>

              <li>
                Any dispute / delay / cancellation is strictly between parties.{" "}
                <b>YuvaQ is not liable</b>.
              </li>

              <li>
                <b>Important:</b> Price is <b>per MT</b>. Total is calculated as{" "}
                <b>(Price/MT × Total MT)</b>.{" "}
                {showPromo ? (
                  <>
                    Advance is <b>FREE (Promo)</b> for now. Payable today is{" "}
                    <b>₹0</b>.
                  </>
                ) : (
                  <>
                    You will pay <b>{advancePercent}%</b> of the total amount
                    via Razorpay as advance.
                  </>
                )}
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-600">Price / MT</span>
                <b className="text-right break-words">₹{pricePerMtText}</b>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-600">Total Weight</span>
                <b className="text-right break-words">{weightText} MT</b>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-600">Total Amount</span>
                <b className="text-right break-words">₹{totalText}</b>
              </div>

              {showPromo ? (
                <div className="flex items-start justify-between gap-4 mt-2 pt-2 border-t border-emerald-200">
                  <span className="text-slate-600">
                    Regular Payable ({displayPercentResolved}% Advance)
                  </span>
                  <b className="text-right text-slate-500 line-through break-words">
                    ₹{displayAdvanceText}
                  </b>
                </div>
              ) : null}

              <div
                className={`flex items-start justify-between gap-4 ${
                  showPromo ? "mt-2" : "mt-2 pt-2 border-t border-emerald-200"
                }`}
              >
                <span className="text-slate-600">
                  {showPromo
                    ? "Payable Now (Promo Free)"
                    : `Payable Now (${advancePercent}% Advance)`}
                </span>

                <b className="text-right text-emerald-700 break-words">
                  ₹{showPromo ? "0" : advanceText}
                </b>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-emerald-700 mt-3 leading-relaxed">
              {showPromo
                ? "Note: Promo applied — payable amount is ₹0 for now. Razorpay will apply when enabled."
                : `Note: You are paying only ${advancePercent}% of total as advance via Razorpay.`}
            </p>
          </div>

          <label className="flex items-start gap-3 select-none cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
            />

            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 leading-snug">
                I have read and agree to the terms & conditions.
              </p>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pay Now will be enabled only after you accept.
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
            >
              Cancel
            </button>

            {agreed ? (
              <button
                type="button"
                onClick={onAgree}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="truncate">
                      {showPromo
                        ? "Finalize (Promo Free)"
                        : `Pay Now ₹${advanceText}`}
                    </span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};