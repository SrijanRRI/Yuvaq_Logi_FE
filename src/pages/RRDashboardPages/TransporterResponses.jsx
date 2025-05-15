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
}) => {
  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <h4 className="text-xl font-semibold mb-5 text-slate-800 flex items-center gap-2">
        <Truck className="h-5 w-5 text-indigo-600" /> Transporter Responses
      </h4>

      {responseError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-sm mb-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Error Loading Responses</p>
            <p>{responseError}</p>
          </div>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <div className="bg-white rounded-full p-4 inline-flex mb-3 shadow-sm">
            <Truck className="h-10 w-10 text-slate-300" />
          </div>
          <p className="text-slate-700 font-medium mb-2">No responses received yet</p>
          <p className="text-slate-500 text-sm">Transporters haven't submitted any quotations for this tender</p>
        </div>
      ) : (
        <div className="space-y-5">
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TransporterResponses
