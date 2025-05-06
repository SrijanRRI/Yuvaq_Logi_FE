import { useState } from "react"
import {
  Calendar,
  MapPin,
  Package,
  AlertCircle,
  DollarSign,
  Star,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Truck,
} from "lucide-react"

const HistoryView = ({ tenders }) => {
  const [expandedId, setExpandedId] = useState(null)
  const [expandedQuotationsId, setExpandedQuotationsId] = useState(null)

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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="grid gap-6 px-4 py-6 md:px-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Tender History</h2>
      <p className="text-gray-600 mb-6">View your past tenders and quotation details</p>

      {tenders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tenders Found</h3>
          <p className="text-gray-600">You don't have any tender history yet.</p>
        </div>
      ) : (
        tenders.map((item, idx) => {
          const tender = item.tender
          const quotations = item.quotations || []
          const finalizedStatus = tender.finalizedStatus
          const isFinalized = finalizedStatus ? true : false

          return (
            <div
              key={tender._id || idx}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
            >
              {/* Header */}
              <div
                className={`bg-gradient-to-r ${isFinalized ? "from-emerald-800 to-teal-700" : "from-indigo-800 to-violet-700"} text-white p-5`}
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-white/80" />
                      <p className="text-white text-lg font-bold">Tender #{idx + 1}</p>
                    </div>
                    {finalizedStatus && (
                      <p className="text-sm mt-2 text-emerald-200 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-300" /> {finalizedStatus}
                      </p>
                    )}
                  </div>
                  <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm">
                    {formatDate(tender.closeDate)}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-5 space-y-6">
                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-medium text-gray-800">{tender.dispatchLocation || "No location specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delivery Window</p>
                      <p className="font-medium text-gray-800">
                        {formatDate(tender.deliveryWindow?.from)} → {formatDate(tender.deliveryWindow?.to)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tender Close Date</p>
                      <p className="font-medium text-gray-800">{formatDate(tender.closeDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="bg-teal-100 p-2 rounded-full">
                      <Package className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Shipment</p>
                      <p className="font-medium text-gray-800">
                        {tender.totalWeight} MT | {tender.totalQuantity} pcs
                      </p>
                    </div>
                  </div>
                </div>

                {/* All quotations */}
                {quotations.length > 0 && (
                  <div className="border-t border-gray-100 pt-5">
                    <button
                      onClick={() => setExpandedQuotationsId((prev) => (prev === tender._id ? null : tender._id))}
                      className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-indigo-50"
                    >
                      <Package className="w-4 h-4" />
                      {expandedQuotationsId === tender._id ? "Hide Quotations" : "View Quotations"}
                      {expandedQuotationsId === tender._id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {expandedQuotationsId === tender._id && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                          Your Quotations
                        </h4>
                        <div className="grid gap-4">
                          {quotations.map((q, qidx) => {
                            const isFinalized = q.vehicleNumber?.toLowerCase().includes("final")
                            return (
                              <div
                                key={q._id}
                                className={`rounded-lg border ${isFinalized ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 bg-gray-50"} p-5 transition-all duration-300 hover:shadow-sm`}
                              >
                                <div className="flex justify-between items-center mb-4">
                                  <div
                                    className={`text-sm font-medium px-3 py-1 rounded-full ${isFinalized ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}
                                  >
                                    Quotation #{qidx + 1} {isFinalized && "• Finalized"}
                                  </div>
                                  <div className="text-xs text-gray-500">{formatDateTime(q.createdAt)}</div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`p-2 rounded-full ${isFinalized ? "bg-emerald-100" : "bg-green-100"}`}
                                    >
                                      <DollarSign
                                        className={`w-4 h-4 ${isFinalized ? "text-emerald-600" : "text-green-600"}`}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Bid Price</p>
                                      <p className={`font-bold ${isFinalized ? "text-emerald-700" : "text-gray-800"}`}>
                                        ₹ {q.price?.toLocaleString("en-IN")}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                      <Calendar className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Submitted On</p>
                                      <p className="font-medium text-gray-800">{formatDateTime(q.createdAt)}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="bg-yellow-100 p-2 rounded-full">
                                      <Truck className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Vehicle Number</p>
                                      <p className="font-medium text-gray-800">{q.vehicleNumber || "N/A"}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Image toggle per quotation */}
                                {q.files?.length > 0 ? (
                                  <div className="mt-4">
                                    <button
                                      onClick={() =>
                                        setExpandedId((prev) => (prev === `${q._id}-img` ? null : `${q._id}-img`))
                                      }
                                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition px-3 py-2 rounded-lg hover:bg-indigo-50"
                                    >
                                      <ImageIcon className="w-4 h-4" />
                                      {expandedId === `${q._id}-img` ? "Hide Images" : "View Images"}
                                      {expandedId === `${q._id}-img` ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </button>

                                    {expandedId === `${q._id}-img` && (
                                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                                        {q.files.map((file, i) => (
                                          <a
                                            key={i}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block aspect-square border rounded-md overflow-hidden shadow-sm hover:shadow-md transition group"
                                          >
                                            <div className="relative w-full h-full">
                                              <img
                                                src={file.url || "/placeholder.svg"}
                                                alt={file.name || `Quotation Image ${i + 1}`}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                              />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-medium">View Image</span>
                                              </div>
                                            </div>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 mt-2 italic flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> No images attached
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Toggle expanded details */}
                <div className="flex justify-center pt-2 border-t border-gray-100">
                  <button
                    onClick={() => toggleExpand(tender._id || idx)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {expandedId === (tender._id || idx) ? (
                      <>
                        Hide Details <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show More Details <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded details */}
                {expandedId === (tender._id || idx) && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300 pt-4">
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

                    {/* Materials Table */}
                    {tender.materials?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                          <h4 className="font-semibold text-gray-800">Materials</h4>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left font-medium text-gray-700">Material</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-700">Sub Material</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-700">Weight (MT)</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-700">Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tender.materials.map((m, i) => (
                                <tr
                                  key={m._id || i}
                                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-4 py-3 font-medium text-gray-700">{m.material}</td>
                                  <td className="px-4 py-3 text-gray-600">{m.subMaterial || "-"}</td>
                                  <td className="px-4 py-3 text-right text-gray-700">{m.weight}</td>
                                  <td className="px-4 py-3 text-right text-gray-700">{m.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                              <tr>
                                <td colSpan="2" className="px-4 py-2 text-right font-medium text-gray-700">
                                  Total:
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-gray-800">
                                  {tender.totalWeight} MT
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-gray-800">
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
          )
        })
      )}
    </div>
  )
}

export default HistoryView
