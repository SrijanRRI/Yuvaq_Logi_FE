// import { useState, useEffect } from "react";
import { Calendar, MapPin, Package, Clock, AlertCircle, Timer, Scale } from "lucide-react";
import CountdownTimer from "../../components/CountdownTimer";

const UpcomingTenders = ({ tenders }) => {

  // Format date to readable format
  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "N/A";

  // Format date with time
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

  // Get tender status based on dates
  const getTenderStatus = (tender) => {
    const now = new Date().getTime();
    const biddingStart = new Date(tender.biddingStart).getTime();
    const biddingEnd = new Date(tender.biddingEnd).getTime();

    if (now < biddingStart) return "upcoming";
    if (now >= biddingStart && now <= biddingEnd) return "active";
    return "closed";
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "active":
        return "Bidding Open";
      case "closed":
        return "Closed";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="grid gap-6">
      {tenders.map((tender, idx) => {
        const status = getTenderStatus(tender);
        const statusColor = getStatusColor(status);

        return (
          <div
            key={tender._id || idx}
            className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200"
          >
            {/* Header with status badge */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200 rounded-t-xl">
              <div className="flex flex-wrap justify-between items-center gap-4">
                {/* Tender Title */}
                <div className="text-xl sm:text-2xl font-bold text-slate-600">
                  Tender #{idx + 1}
                </div>

                {/* Status Badge */}
                <div className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                  {getStatusText(status)}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="p-5 space-y-5">
              {/* Countdown timer for upcoming tenders */}
              {status === "upcoming" && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 animate-pulse">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                    <Timer className="w-5 h-5" />
                    <span>Bidding Opens In</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800 tabular-nums">
                    <CountdownTimer endTime={tender.biddingStart} />
                  </div>
                </div>
              )}

              {/* Enhanced Bidding Period Section */}
              <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-indigo-100 shadow-sm p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-300/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/20 to-indigo-200/20 rounded-full -ml-12 -mb-12 blur-xl"></div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-indigo-900">Bidding Period</h4>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="text-xs uppercase tracking-wider text-indigo-500 font-medium">Start</div>
                      <div className="font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-indigo-100 text-indigo-900 inline-block">
                        {formatDateTime(tender.biddingStart)}
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <div className="relative h-0.5 w-16 bg-gradient-to-r from-indigo-300 to-purple-300">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 animate-ping"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600"></div>
                      </div>
                    </div>

                    <div className="md:hidden w-0.5 h-8 my-1 bg-gradient-to-b from-indigo-300 to-purple-300 self-center">
                      <div className="relative">
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600"></div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="text-xs uppercase tracking-wider text-purple-500 font-medium">End</div>
                      <div className="font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-100 text-purple-900 inline-block">
                        {formatDateTime(tender.biddingEnd)}
                      </div>
                    </div>
                  </div>

                  {status === "active" && (
                    <div className="mt-4 px-4 py-2 bg-green-100/70 backdrop-blur-sm border border-green-200 rounded-lg inline-flex items-center w-full sm:w-auto justify-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-green-800 font-medium">Bidding Currently Active</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <div className="text-slate-500 mb-1">Location</div>
                    <div className="font-medium text-slate-800">
                      {tender.dispatchLocation || "No location specified"} , {tender.pincode}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <div className="text-slate-500 mb-1">Delivery Window</div>
                    <div className="font-medium text-slate-800">
                      {formatDate(tender.deliveryWindow?.from)} → {formatDate(tender.deliveryWindow?.to)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <div className="text-slate-500 mb-1">Closing Date</div>
                    <div className="font-medium text-slate-800">{formatDate(tender.closeDate)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                  <Scale className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <div className="text-slate-500 mb-1">Max Bid Amount</div>
                    <div className="font-medium text-slate-800">{Number(tender.maxBidAmount).toLocaleString("en-IN") || " - "}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors sm:col-span-2">
                  <Package className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <div className="text-slate-500 mb-1">Shipment Details</div>
                    <div className="font-medium text-slate-800">
                      Total Weight: <span className="text-slate-700">{tender.totalWeight} MT</span> | Total Quantity:{" "}
                      <span className="text-slate-700">{tender.totalQuantity} pcs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks section */}
              {tender.remarks && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm hover:bg-amber-100/70 transition-colors">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-800 mb-1">Remarks</div>
                      <div className="text-amber-700">{tender.remarks}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Materials table */}
              {tender.materials?.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-slate-700" />
                    <h4 className="font-semibold text-slate-800">Materials</h4>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="px-4 py-3 text-left font-medium text-slate-700">Material</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-700">Sub Material</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-700">Weight (MT)</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-700">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tender.materials.map((m, i) => (
                          <tr
                            key={m._id || i}
                            className={`border-t border-slate-200 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50/50 transition-colors`}
                          >
                            <td className="px-4 py-3 font-medium text-slate-700">{m.material}</td>
                            <td className="px-4 py-3 text-slate-600">{m.subMaterial || "-"}</td>
                            <td className="px-4 py-3 text-right text-slate-700 font-medium">{m.weight}</td>
                            <td className="px-4 py-3 text-right text-slate-700 font-medium">{m.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                          <td colSpan="2" className="px-4 py-2 text-right font-medium text-slate-700">
                            Total:
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-slate-800">{tender.totalWeight} MT</td>
                          <td className="px-4 py-2 text-right font-bold text-slate-800">{tender.totalQuantity} pcs</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingTenders;