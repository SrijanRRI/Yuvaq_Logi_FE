import { useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

export const TenderTermsModal = ({ finalPrice, onCancel, onAgree, isLoading = false }) => {
  const [agreed, setAgreed] = useState(false)

  const priceText = useMemo(() => {
    const n = Number(finalPrice)
    return Number.isFinite(n) ? n.toLocaleString() : "-"
  }, [finalPrice])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        disabled={isLoading}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-800 p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold">Caution • Terms & Conditions</h3>
              <p className="text-white/90 text-sm mt-1">
                You’re proceeding to finalize this quotation at{" "}
                <span className="font-semibold">₹{priceText}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 text-slate-700">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>YuvaQ</b> is a technology platform for tender creation and bid collection.
              </li>
              <li>
                Tender details (materials, weights, dates, locations, terms) are provided by the tender creator.
                <b> YuvaQ does not verify</b> the accuracy or completeness of these details.
              </li>
              <li>
                Any backout, cancellation, delay, dispute, negotiation, or non-performance by any transporter is strictly
                between the involved parties. <b>YuvaQ is not liable</b> for resulting loss or damages.
              </li>
              <li>
                YuvaQ does not guarantee bid participation, bid validity, transporter availability, or delivery performance.
              </li>
              <li>
                Proceed only if you have reviewed the tender and quotation details thoroughly.
              </li>
            </ul>
          </div>

          {/* ✅ Checkbox */}
          <label className="flex items-start gap-3 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">
                I have read and agree to the terms & conditions.
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Pay Now will be enabled only after you accept.
              </p>
            </div>
          </label>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
          >
            Cancel
          </button>

          {/* ✅ Show Pay Now ONLY after tick */}
          {agreed ? (
            <button
              type="button"
              onClick={onAgree}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Pay Now
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
