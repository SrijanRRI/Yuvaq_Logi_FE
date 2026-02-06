import TransporterResponseItem from "./TransporterResponseItem"
import { Truck, AlertCircle } from "lucide-react"

const TransporterResponses = ({
  responses,
  tender,
  selectedQuotationId,
  confirmedIdxMap,
  reopenedTenders,
  editingId,
  priceInput,
  setEditingId,
  setPriceInput,
  onConfirmFinal,
  onReopen,
  getTransporterName,
  setPreviewFile,
  responseError,
  contact,
  contactLoading,
  onRevealContact,
}) => {
  return (
    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
      <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-slate-800 flex items-center gap-2">
        <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
        <span className="truncate">Transporter Responses</span>
      </h4>

      {responseError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg sm:rounded-xl p-4 sm:p-5 text-sm mb-4 sm:mb-5 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium mb-1">Error Loading Responses</p>
            <p className="break-words">{responseError}</p>
          </div>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
          <div className="bg-white rounded-full p-3 sm:p-4 inline-flex mb-3 shadow-sm">
            <Truck className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300" />
          </div>
          <p className="text-slate-700 font-medium mb-2 text-sm sm:text-base">No responses received yet</p>
          <p className="text-slate-500 text-xs sm:text-sm">
            Transporters haven't submitted any quotations for this tender
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {responses.map((res, idx) => (
            <TransporterResponseItem
              key={res._id || idx}
              response={res}
              idx={idx}
              tender={tender}
              selectedQuotationId={selectedQuotationId}
              confirmedIdxMap={confirmedIdxMap}
              reopenedTenders={reopenedTenders}
              editingId={editingId}
              priceInput={priceInput}
              setEditingId={setEditingId}
              setPriceInput={setPriceInput}
              onConfirmFinal={onConfirmFinal}
              onReopen={onReopen}
              getTransporterName={getTransporterName}
              setPreviewFile={setPreviewFile}
              contact={contact}
              contactLoading={contactLoading}
              onRevealContact={onRevealContact}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TransporterResponses
