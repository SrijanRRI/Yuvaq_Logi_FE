import { CheckCircle, FileText, RefreshCcw } from "lucide-react";

const TransporterResponseItem = ({
  response,
  idx,
  tender,
  selectedQuotationId,
  confirmedIdxMap,
  editingId,
  priceInput,
  setEditingId,
  setPriceInput,
  onConfirmFinal,
  onReopen,
  getTransporterName,
  setPreviewFile,
}) => {
  const tenderId = tender._id;
  const isSelected = response._id === selectedQuotationId;
  const isDimmed = tender.status === "finalized" && !isSelected;
  const isEditing = editingId === `${tenderId}-${idx}`;

  const reopenCount = tender.reopenCount || 0;
  const canReopen = reopenCount < 2;

  const rankOrder = ["L1", "L2", "L3"];
  const allowedRankIndex = reopenCount;
  const currentRank = response.rank;
  const canConfirm = rankOrder[allowedRankIndex] === currentRank;

  return (
    <div className={`border-l-4 p-5 rounded-lg shadow-sm transition duration-300 ${isDimmed ? "border-slate-300 bg-slate-100 opacity-60" : "border-emerald-500 bg-white"}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">Transporter</p>
          <p className="text-lg font-semibold text-slate-800">
            {getTransporterName(response.transportUser)}
            {isSelected && tender.status === "finalized" && (
              <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Finalized
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Price</p>
          <p className="text-lg font-semibold text-green-700">₹{response.price}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Vehicle Detail</p>
          <p className="text-md font-medium text-slate-700">{response.vehicleNumber}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Attachments</p>
          <div className="text-sm text-slate-700 space-y-1">
            {response?.files?.length > 0 ? (
              response.files.map((file, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewFile({ url: file.url || file, mimetype: file.mimetype || "", originalName: file.originalName || `Attachment ${i + 1}` })}
                  className="text-emerald-600 hover:underline text-left flex items-center gap-1"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {file.originalName || `Attachment ${i + 1}`}
                </button>
              ))
            ) : (
              <p>No attachments</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-500">Rank</p>
          <p className="text-md font-medium text-slate-700">{response.rank}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Quoted At</p>
          <p className="text-md font-medium text-slate-700">
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
      <div className="mt-4">
        {isSelected && tender.status === "finalized" ? (
          <div className="flex flex-col md:flex-row md:items-center gap-3 text-green-700 font-semibold text-md bg-green-50 p-3 rounded-md border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Final Deal Price: ₹{tender.finalPrice || response.price}
            </div>
            {new Date() < new Date(tender.closeDate) && (
              <button
                onClick={() => onReopen(tenderId)}
                disabled={!canReopen}
                className={`text-sm px-3 py-1 rounded-md transition border ${canReopen ? "text-emerald-600 border-emerald-300 hover:bg-emerald-50" : "text-slate-400 border-slate-200 cursor-not-allowed"}`}
              >
                {canReopen ? "Reopen Quotation" : "Max Reopens Reached"}
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <RefreshCcw className="h-4 w-4" /> Reopen Attempts: {reopenCount} / 2
            </div>
          </div>
        ) : tender.status !== "finalized" && isEditing ? (
          <div className="mt-3 flex gap-3 items-center">
            <input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="border border-slate-300 px-3 py-2 rounded-md w-40 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Final Price"
            />
            <button
              onClick={() => onConfirmFinal(tenderId, idx, Number(priceInput))}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Confirm
            </button>
          </div>
        ) : tender.status !== "finalized" && confirmedIdxMap[tenderId] === undefined && canConfirm ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-slate-600">Confirm this price as final?</p>
            <button
              onClick={() => {
                setPriceInput(response.price);
                onConfirmFinal(tenderId, idx, response.price)
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Confirm ₹{response.price}
            </button>
          </div>
        ) : confirmedIdxMap[tenderId] === undefined ? (
          <div className="mt-3">
            <button disabled className="px-4 py-2 bg-slate-200 text-slate-500 rounded-md cursor-not-allowed">
              Disabled
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TransporterResponseItem;