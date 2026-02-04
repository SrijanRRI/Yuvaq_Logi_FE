import { CheckCircle, FileText, RefreshCcw, Check, Award, Truck, Info } from "lucide-react"

const TransporterResponseItem = ({
  response,
  idx,
  tender,
  selectedQuotationId,
  confirmedIdxMap,
  editingId,
  onConfirmFinal,
  onReopen,
  getTransporterName,
  setPreviewFile,
}) => {
  const tenderId = tender._id
  const isFinalizedView =
    tender.status === "finalized" || (tender.status === "closed" && tender.selectedQuotation && tender.finalPrice)
  const isSelected = response._id === selectedQuotationId
  const isDimmed = isFinalizedView && !isSelected

  const isBeforeOrOnClosingDay = () => {
    const now = new Date()
    const closeDateEnd = new Date(tender.closeDate)
    closeDateEnd.setHours(23, 59, 59, 999)
    return now <= closeDateEnd
  }

  const reopenCount = tender.reopenCount || 0
  const canReopen = reopenCount < 2
  const canReopenQuotation = tender.status === "finalized" && canReopen && isBeforeOrOnClosingDay()

  const rankOrder = ["L1", "L2", "L3"]
  const allowedRankIndex = reopenCount
  const currentRank = response.rank
  const canConfirm = rankOrder[allowedRankIndex] === currentRank

  return (
    <div
      className={`rounded-lg sm:rounded-xl shadow-sm transition duration-300 overflow-hidden ${isDimmed
          ? "border border-slate-200 bg-slate-50"
          : isSelected
            ? "border-2 border-emerald-500 bg-white"
            : "border border-slate-200 bg-white"
        }`}
    >
      {/* Header Section */}
      <div
        className={`${isSelected
            ? "bg-emerald-50 border-b border-emerald-100"
            : isDimmed
              ? "bg-slate-100 border-b border-slate-200"
              : "bg-indigo-50 border-b border-indigo-100"
          } px-4 sm:px-5 py-3`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full flex-shrink-0 ${isSelected ? "bg-emerald-100" : "bg-indigo-100"}`}>
              <Truck className={`h-4 w-4 sm:h-5 sm:w-5 ${isSelected ? "text-emerald-600" : "text-indigo-600"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                {/* {getTransporterName(response.transportUser)} */}
                Transporter {idx + 1}
              </h5>
              {/* Improved Rank Badge */}
              <div className="mt-1 inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-emerald-200 to-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm shadow-md">
                Rank: {response.rank}
              </div>
            </div>
          </div>
          {isSelected && tender.status === "finalized" && (
            <div className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-200 self-start sm:self-center flex-shrink-0">
              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="whitespace-nowrap">Finalized</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5">
        {/* Mobile Card Layout */}
        <div className="block sm:hidden space-y-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Price</p>
            <p className="text-xl font-bold text-emerald-600">₹{response.price.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Vehicle Detail</p>
            <p className="text-sm font-medium text-slate-700 break-words">
              {response.vehicleNumber || "Not specified"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Attachments</p>
            <div className="text-xs text-slate-700 space-y-1.5 mt-1">
              {response?.files?.length > 0 ? (
                response.files.map((file, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setPreviewFile({
                        url: file.url || file,
                        mimetype: file.mimetype || "",
                        originalName: file.originalName || `Attachment ${i + 1}`,
                      })
                    }
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-left flex items-center gap-1.5 py-1 w-full min-w-0"
                  >
                    <FileText className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{file.originalName || `Attachment ${i + 1}`}</span>
                  </button>
                ))
              ) : (
                <p className="text-slate-500 italic">No attachments</p>
              )}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Quoted At</p>
            <p className="text-sm font-medium text-slate-700">
              {new Date(response.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Price</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">₹{response.price.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Vehicle Detail</p>
            <p className="text-base sm:text-lg font-medium text-slate-700 break-words">
              {response.vehicleNumber || "Not specified"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Attachments</p>
            <div className="text-sm text-slate-700 space-y-1.5 mt-1">
              {response?.files?.length > 0 ? (
                response.files.map((file, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setPreviewFile({
                        url: file.url || file,
                        mimetype: file.mimetype || "",
                        originalName: file.originalName || `Attachment ${i + 1}`,
                      })
                    }
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-left flex items-center gap-1.5 py-1 w-full min-w-0"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{file.originalName || `Attachment ${i + 1}`}</span>
                  </button>
                ))
              ) : (
                <p className="text-slate-500 italic">No attachments</p>
              )}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Quoted At</p>
            <p className="text-base font-medium text-slate-700">
              {new Date(response.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-5">
          {(isSelected || confirmedIdxMap[tenderId] === idx) && isFinalizedView ? (
            <div className="flex flex-col gap-4 bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="break-words">
                  Final Deal Price: ₹{tender.finalPrice?.toLocaleString() || response.price.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onReopen(tenderId)}
                  disabled={!canReopenQuotation}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition border flex items-center justify-center gap-2 text-sm sm:text-base ${canReopenQuotation
                      ? "text-indigo-600 border-indigo-300 bg-white hover:bg-indigo-50"
                      : "text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed"
                    }`}
                >
                  <RefreshCcw className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {canReopenQuotation
                      ? "Reopen Quotation"
                      : !isBeforeOrOnClosingDay()
                        ? "Closed"
                        : "Max Reopens Reached"}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                  <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Reopen Attempts: {reopenCount} / 2</span>
                </div>
              </div>
            </div>
          ) : !isFinalizedView && confirmedIdxMap[tenderId] === undefined && canConfirm ? (
            <div className="flex flex-col gap-3 bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
              <p className="text-slate-700 text-sm sm:text-base">Would you like to confirm this quotation?</p>
              <div className="flex gap-2">
                <button
                  // onClick={() => onConfirmFinal(tenderId, idx, response.price)}
                  onClick={() =>
                    onConfirmFinal({
                      tender,
                      quotation: response, // has _id + price + rank etc.
                    })
                  }
                  className="px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm sm:text-base min-w-0"
                >
                  <Check className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Confirm ₹{response.price.toLocaleString()}</span>
                </button>
              </div>
            </div>
          ) : confirmedIdxMap[tenderId] === undefined && !canConfirm ? (
            <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 text-slate-500 text-xs sm:text-sm flex items-start gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="break-words">
                {currentRank
                  ? `This ${currentRank} quotation can be selected after reopening`
                  : "This quotation cannot be selected at this time"}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default TransporterResponseItem
