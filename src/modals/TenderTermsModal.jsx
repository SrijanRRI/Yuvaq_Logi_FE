import { AlertTriangle } from "lucide-react"

export const TenderTermsModal = ({ finalPrice, onCancel, onAgree }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
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
                <span className="font-semibold">₹{Number(finalPrice).toLocaleString()}</span>.
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

          <p className="text-xs text-slate-500">
            By clicking <b>“I Agree”</b>, you accept the above terms and move to the final confirmation step.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAgree}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  )
}
