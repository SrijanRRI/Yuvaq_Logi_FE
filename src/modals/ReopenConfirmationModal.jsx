import { useState } from "react"
import { X, RefreshCcw, AlertCircle } from "lucide-react"

const ReopenConfirmationModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const handleCancel = () => {
    if (typeof onCancel === "function") {
      onCancel()
    }
  }

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please provide a reason to reopen this Quotation")
      return
    }
    onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-5 text-white flex-shrink-0">
          <div className="flex justify-between items-center gap-3">
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 min-w-0">
              <RefreshCcw className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Reopen Quotation</span>
            </h3>
            <button
              onClick={handleCancel}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 sm:p-1.5 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <p className="text-slate-600 mb-4 text-sm sm:text-base leading-relaxed">
            Reopening the quotation allows the tenderer to select a different transporter. Please provide a reason for
            reopening this quotation.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Reason for reopening</label>
            <textarea
              className={`w-full border ${
                error ? "border-red-300 bg-red-50" : "border-slate-300"
              } rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm sm:text-base resize-none`}
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError("")
              }}
              placeholder="Please explain why you need to reopen this Quotation..."
            />
            {error && (
              <p className="text-sm text-red-600 flex items-start gap-1.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{error}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 sm:px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <X className="h-4 w-4 flex-shrink-0" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <RefreshCcw className="h-4 w-4 flex-shrink-0" />
              <span>Reopen Quotation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReopenConfirmationModal
