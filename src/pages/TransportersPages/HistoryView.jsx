import { useState } from "react"
import { Calendar, MapPin, Package, Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react"

const HistoryView = ({ tenders }) => {
  const [expandedId, setExpandedId] = useState(null)

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A"

  const formatDateTime = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A"

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return (
          <div className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium text-xs">Accepted</span>
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
            <XCircle className="w-4 h-4" />
            <span className="font-medium text-xs">Rejected</span>
          </div>
        )
      case "pending":
        return (
          <div className="flex items-center gap-1 text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            <Clock className="w-4 h-4" />
            <span className="font-medium text-xs">Pending</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium text-xs">Unknown</span>
          </div>
        )
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="grid gap-6">
      {tenders.map((tender, idx) => (
        <div
          key={tender._id || idx}
          className="bg-white rounded-xl overflow-hidden border border-slate-200 transition-all hover:shadow-md"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-5">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <h3 className="text-xl font-bold">{tender.projectName || "Unnamed Project"}</h3>
                <p className="text-slate-300 text-sm mt-1">Tender #{idx + 1}</p>
              </div>
              {tender.status && getStatusBadge(tender.status)}
            </div>
          </div>

          {/* Main content */}
          <div className="p-5 space-y-5">
            {/* Bid details */}
            {tender.quotation && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                  <h4 className="font-semibold text-slate-800">Your Quotation</h4>
                  {tender.quotation.status && getStatusBadge(tender.quotation.status)}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Your Bid</p>
                      <p className="font-bold text-slate-800">
                        ₹ {tender.quotation.price?.toLocaleString("en-IN") || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Submitted On</p>
                      <p className="font-medium text-slate-800">{formatDateTime(tender.quotation.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Location</p>
                  <p className="font-medium text-slate-800">{tender.dispatchLocation || "No location specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Delivery Window</p>
                  <p className="font-medium text-slate-800">
                    {formatDate(tender.deliveryWindow?.from)} → {formatDate(tender.deliveryWindow?.to)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Bidding Period</p>
                  <p className="font-medium text-slate-800">
                    {formatDateTime(tender.biddingStart)} → {formatDateTime(tender.biddingEnd)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <Package className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Shipment Details</p>
                  <p className="font-medium text-slate-800">
                    {tender.totalWeight} kg | {tender.totalQuantity} pcs
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle button for details */}
            <div className="flex justify-center">
              <button
                onClick={() => toggleExpand(tender._id || idx)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {expandedId === (tender._id || idx) ? "Hide Details" : "Show More Details"}
              </button>
            </div>

            {/* Expanded details */}
            {expandedId === (tender._id || idx) && (
              <div className="animate-fadeIn">
                {/* Remarks section */}
                {tender.remarks && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 mb-1">Remarks</p>
                        <p className="text-amber-700 text-sm">{tender.remarks}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Materials table */}
                {tender.materials?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-5 h-5 text-slate-700" />
                      <h4 className="font-semibold text-slate-800">Materials</h4>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-4 py-3 text-left font-medium text-slate-700">Material</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-700">Sub Material</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-700">Weight (kg)</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-700">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tender.materials.map((m, i) => (
                            <tr key={m._id || i} className="border-t border-slate-200">
                              <td className="px-4 py-3 font-medium text-slate-700">{m.material}</td>
                              <td className="px-4 py-3 text-slate-600">{m.subMaterial || "-"}</td>
                              <td className="px-4 py-3 text-right text-slate-700">{m.weight}</td>
                              <td className="px-4 py-3 text-right text-slate-700">{m.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200">
                          <tr>
                            <td colSpan="2" className="px-4 py-2 text-right font-medium text-slate-700">
                              Total:
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-slate-800">{tender.totalWeight} kg</td>
                            <td className="px-4 py-2 text-right font-bold text-slate-800">
                              {tender.totalQuantity} pcs
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default HistoryView
