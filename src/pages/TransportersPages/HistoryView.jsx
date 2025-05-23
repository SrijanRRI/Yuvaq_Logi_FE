import React, { useState } from "react";
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
  Scale,
} from "lucide-react";

const HistoryView = ({ tenders }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [expandedQuotationsId, setExpandedQuotationsId] = useState(null);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "N/A";

  const formatDateTime = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "N/A";

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="grid gap-8">
      {tenders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-gray-200 text-center shadow-lg">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Tenders Found</h3>
          <p className="text-gray-500 max-w-md">
            You don't have any tender history yet. Active tenders will appear here once completed.
          </p>
        </div>
      ) : (
        tenders.map((item, idx) => {
          const tender = item.tender;
          const quotations = item.quotations || [];
          const finalizedStatus = tender.finalizedStatus;

          return (
            <div
              key={tender._id || idx}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              {/* Header */}
              <div
                className={`bg-gradient-to-r ${finalizedStatus
                    ? "from-emerald-600 via-emerald-700 to-teal-700"
                    : "from-indigo-600 via-indigo-700 to-violet-700"
                  } text-white p-6`}
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-white/80" />
                      <p className="text-xl font-bold">Tender #{idx + 1}</p>
                    </div>

                    {["finalized", "closed"].includes(tender.status) ? (
                      finalizedStatus && (
                        <p className="text-sm mt-2 text-emerald-100 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-300" /> {finalizedStatus}
                        </p>
                      )
                    ) : tender.status === "open" ? (
                      <p className="text-sm mt-2 text-blue-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-200" /> Your quotation is pending. Please wait...
                      </p>
                    ) : null}

                  </div>
                  <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm border border-white/20">
                    {formatDate(tender.closeDate)}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6 space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Location */}
                  <InfoCard icon={<MapPin className="w-5 h-5" />} label="Location" value={tender.dispatchLocation || "No location specified"} bg="bg-indigo-100 text-indigo-600" />

                  {/* Delivery Window */}
                  <InfoCard icon={<Calendar className="w-5 h-5" />} label="Delivery Window" value={`${formatDate(tender.deliveryWindow?.from)} → ${formatDate(tender.deliveryWindow?.to)}`} bg="bg-purple-100 text-purple-600" />

                  {/* Tender Close Date */}
                  <InfoCard icon={<Calendar className="w-5 h-5" />} label="Tender Close Date" value={formatDate(tender.closeDate)} bg="bg-blue-100 text-blue-600" />

                  {/* Max Bid */}
                  <InfoCard icon={<Scale className="w-5 h-5" />} label="Max Bid Amount" value={`₹ ${tender.maxBidAmount?.toLocaleString("en-IN") || "N/A"} ${tender.maxBidUnit ? `(${tender.maxBidUnit})` : " - "}`} bg="bg-red-100 text-red-600" />

                  {/* Shipment */}
                  <InfoCard icon={<Package className="w-5 h-5" />} label="Shipment" value={`${tender.totalWeight} MT | ${tender.totalQuantity} pcs`} bg="bg-teal-100 text-teal-600" span="sm:col-span-2 lg:col-span-2" />
                </div>

                {/* Quotations */}
                {quotations.length > 0 && (
                  <div className="border-t border-gray-100 pt-5">
                    <button
                      onClick={() => setExpandedQuotationsId((prev) => (prev === tender._id ? null : tender._id))}
                      className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50"
                    >
                      <Package className="w-4 h-4" />
                      {expandedQuotationsId === tender._id ? "Hide Quotations" : "View Your Quotations"}
                      {expandedQuotationsId === tender._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expandedQuotationsId === tender._id && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                          Your Quotations
                        </h4>
                        <div className="grid gap-4">
                          {quotations.map((q, qidx) => {
                            const isFinalized = q._id === tender.selectedQuotation;
                            return (
                              <div key={q._id || qidx} className={`rounded-lg border ${
                                isFinalized ? "border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-teal-50/80" : "border-gray-200 bg-gray-50"
                              } p-5 transition-all duration-300 hover:shadow-md group`}>
                                <div className="flex justify-between items-center mb-4">
                                  <div className={`text-sm font-medium px-3 py-1.5 rounded-full ${
                                    isFinalized ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
                                  }`}>
                                    Quotation #{qidx + 1} {isFinalized && "• Finalized"}
                                  </div>
                                  <div className="text-xs text-gray-500">{formatDateTime(q.createdAt)}</div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4 mb-5">
                                  <DataBox icon={<DollarSign className="w-4 h-4 text-green-600" />} label="Bid Price" value={`₹ ${q.price?.toLocaleString("en-IN")}`} bg="bg-green-100" />
                                  <DataBox icon={<Calendar className="w-4 h-4 text-blue-600" />} label="Submitted On" value={formatDateTime(q.createdAt)} bg="bg-blue-100" />
                                  <DataBox icon={<Truck className="w-4 h-4 text-amber-600" />} label="Vehicle Number" value={q.vehicleNumber || "N/A"} bg="bg-amber-100" />
                                </div>

                                {q.files?.length > 0 ? (
                                  <div className="mt-4">
                                    <button
                                      onClick={() => setExpandedId((prev) => (prev === `${q._id || qidx}-img` ? null : `${q._id || qidx}-img`))}
                                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-indigo-50"
                                    >
                                      <ImageIcon className="w-4 h-4" />
                                      {expandedId === `${q._id || qidx}-img` ? "Hide Attachments" : "View Attachments"}
                                      {expandedId === `${q._id || qidx}-img` ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {expandedId === `${q._id || qidx}-img` && (
                                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                                        {q.files.map((file, i) => (
                                          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="block aspect-square border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all group/img">
                                            <div className="relative w-full h-full">
                                              <img src={file.url || "/placeholder.svg"} alt={file.name || `Quotation Image ${i + 1}`} className="object-cover w-full h-full group-hover/img:scale-105 transition-transform duration-300" />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
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
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand Details */}
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

                {/* Expanded Details */}
                {expandedId === (tender._id || idx) && (
                  <div className="pt-4 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    {tender.remarks && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-amber-100 rounded-full">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          </div>
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
                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">Material</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">Sub Material</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b border-gray-200">Weight (MT)</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b border-gray-200">Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tender.materials.map((m, i) => (
                                <tr key={m._id || i} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50/50 transition-colors`}>
                                  <td className="px-4 py-3 font-medium text-gray-700 border-t border-gray-200">{m.material}</td>
                                  <td className="px-4 py-3 text-gray-600 border-t border-gray-200">{m.subMaterial || "-"}</td>
                                  <td className="px-4 py-3 text-right text-gray-700 border-t border-gray-200">{m.weight}</td>
                                  <td className="px-4 py-3 text-right text-gray-700 border-t border-gray-200">{m.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                              <tr>
                                <td colSpan="2" className="px-4 py-2 text-right font-medium text-gray-700">Total:</td>
                                <td className="px-4 py-2 text-right font-bold text-gray-800">{tender.totalWeight} MT</td>
                                <td className="px-4 py-2 text-right font-bold text-gray-800">{tender.totalQuantity} pcs</td>
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
          );
        })
      )}
    </div>
  );
};

// Utility Components
const InfoCard = ({ icon, label, value, bg, span = "" }) => (
  <div className={`flex items-start gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all group-hover:border-indigo-200 ${span}`}>
    <div className={`p-2.5 rounded-full ${bg}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

const DataBox = ({ icon, label, value, bg }) => (
  <div className="flex items-center gap-3">
    <div className={`p-2.5 rounded-full ${bg}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export default HistoryView;
