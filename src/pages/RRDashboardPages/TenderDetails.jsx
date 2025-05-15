import { Briefcase, Package, Scale, Users, Calendar, MapPin, FileText, Clock } from "lucide-react"

const TenderDetails = ({ tender, getTransporterName }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })

  const formatDateWithTime = (dateStr) => {
    const date = new Date(dateStr)
    const datePart = date.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })
    const timePart = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
    return `${datePart}, ${timePart}`
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Left Column */}
      <div className="space-y-5">
        {(tender.projectName || tender.projectCode || tender.purchaseOrder) && (
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" /> Project Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {tender.projectName && (
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Project Name</span>
                  <p className="font-medium text-slate-800">{tender.projectName}</p>
                </div>
              )}
              {tender.projectCode && (
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Project Code</span>
                  <p className="font-medium text-slate-800">{tender.projectCode}</p>
                </div>
              )}
              {tender.purchaseOrder && (
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Purchase Order</span>
                  <p className="font-medium text-slate-800">{tender.purchaseOrder}</p>
                </div>
              )}
            </div>
            {tender.projectRemark && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">Remark</span>
                <p className="text-slate-700 text-sm">{tender.projectRemark}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-500" /> Delivery Window
            </h4>
            <p className="font-medium text-slate-800">
              {tender.deliveryWindow?.from && tender.deliveryWindow?.to
                ? `${formatDate(tender.deliveryWindow.from)} to ${formatDate(tender.deliveryWindow.to)}`
                : "Not specified"}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-500" /> Bidding Window
            </h4>
            <p className="font-medium text-slate-800">
              {tender.biddingStart && tender.biddingEnd
                ? `${formatDateWithTime(tender.biddingStart)} to ${formatDateWithTime(tender.biddingEnd)}`
                : "Not specified"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 shadow-sm border border-yellow-200 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2.5 rounded-full shadow-sm">
                <Scale className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-base font-medium text-slate-700">Maximum Bid Amount</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-yellow-200">
              <span className="text-yellow-700 font-bold text-lg">
                ₹ {tender.maxBidAmount?.toLocaleString() || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-500" /> Closing Date
            </h4>
            <p className="font-medium text-slate-800">{formatDate(tender.closeDate)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-indigo-500" /> Location
            </h4>
            <p className="text-slate-800 text-sm">
              {tender.dispatchLocation}, {tender.address}, {tender.pincode}
            </p>
          </div>
        </div>

        {tender.remarks && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-500" /> Remarks
            </h4>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm">{tender.remarks}</p>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" /> Materials
          </h4>
          {tender.materials?.length > 0 ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-3 py-2 text-left rounded-tl-lg">Material</th>
                      <th className="px-3 py-2 text-left">Sub Item</th>
                      <th className="px-3 py-2 text-right">Weight</th>
                      <th className="px-3 py-2 text-right rounded-tr-lg">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tender.materials.map((mat, idx) => (
                      <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 font-medium">{mat.material}</td>
                        <td className="px-3 py-2.5">{mat.subMaterial || "-"}</td>
                        <td className="px-3 py-2.5 text-right">{mat.weight} MT</td>
                        <td className="px-3 py-2.5 text-right">{mat.quantity} pcs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Weight and Quantity Section */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 shadow-sm border border-emerald-100 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-100 p-2 rounded-full shadow-sm">
                        <Scale className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Total Weight</span>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100">
                      <span className="text-emerald-700 font-bold">{tender.totalWeight} MT</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 shadow-sm border border-sky-100 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-sky-100 p-2 rounded-full shadow-sm">
                        <Package className="h-4 w-4 text-sky-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Total Quantity</span>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-sky-100">
                      <span className="text-sky-700 font-bold">{tender.totalQuantity} pcs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-3 rounded-lg text-center">No materials added</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" /> Selected Transporters
          </h4>
          {tender.transporters?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tender.transporters.map((tid) => (
                <div
                  key={tid}
                  className="bg-indigo-50 px-3 py-2 rounded-lg text-sm flex items-center gap-2 border border-indigo-100 shadow-sm"
                >
                  <div className="bg-indigo-100 p-1 rounded-full">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <span className="font-medium text-slate-700">{getTransporterName(tid)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-3 rounded-lg text-center">No transporters selected</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TenderDetails
