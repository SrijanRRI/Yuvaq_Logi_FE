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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Left Column */}
      <div className="space-y-4 sm:space-y-5">
        {(tender.projectName || tender.projectCode || tender.purchaseOrder) && (
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
              <span className="truncate">Project Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {tender.projectName && (
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 block mb-1">Project Name</span>
                  <p className="font-medium text-slate-800 text-sm sm:text-base break-words">{tender.projectName}</p>
                </div>
              )}
              {tender.projectCode && (
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 block mb-1">Project Code</span>
                  <p className="font-medium text-slate-800 text-sm sm:text-base break-words">{tender.projectCode}</p>
                </div>
              )}
              {tender.purchaseOrder && (
                <div className="min-w-0 sm:col-span-2">
                  <span className="text-xs text-slate-500 block mb-1">Purchase Order</span>
                  <p className="font-medium text-slate-800 text-sm sm:text-base break-words">{tender.purchaseOrder}</p>
                </div>
              )}
            </div>
            {tender.projectRemark && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">Remark</span>
                <p className="text-slate-700 text-xs sm:text-sm break-words">{tender.projectRemark}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Delivery Window</span>
            </h4>
            <p className="font-medium text-slate-800 text-xs sm:text-sm break-words">
              {tender.deliveryWindow?.from && tender.deliveryWindow?.to
                ? `${formatDate(tender.deliveryWindow.from)} to ${formatDate(tender.deliveryWindow.to)}`
                : "Not specified"}
            </p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Bidding Window</span>
            </h4>
            <p className="font-medium text-slate-800 text-xs sm:text-sm break-words">
              {tender.biddingStart && tender.biddingEnd
                ? `${formatDateWithTime(tender.biddingStart)} to ${formatDateWithTime(tender.biddingEnd)}`
                : "Not specified"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Closing Date</span>
            </h4>
            <p className="font-medium text-slate-800 text-xs sm:text-sm">{formatDate(tender.closeDate)}</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Location</span>
            </h4>
            <p className="text-slate-800 text-xs sm:text-sm break-words">
              {tender.dispatchLocation}, {tender.address}, {tender.pincode}
            </p>
          </div>
        </div>

        {tender.remarks && (
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Remarks</span>
            </h4>
            <p className="text-slate-700 bg-slate-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm break-words">
              {tender.remarks}
            </p>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-4 sm:space-y-5">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
            <span className="truncate">Materials</span>
          </h4>
          {tender.materials?.length > 0 ? (
            <div>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-3">
                {tender.materials.map((mat, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-1">Material</span>
                        <p className="font-medium text-slate-800 break-words">{mat.material}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Sub Item</span>
                        <p className="text-slate-700 break-words">{mat.subMaterial || "-"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Weight</span>
                        <p className="font-medium text-slate-800">{mat.weight} MT</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Quantity</span>
                        <p className="font-medium text-slate-800">{mat.quantity} pcs</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-2 sm:px-3 py-2 text-left rounded-tl-lg min-w-0">
                        <span className="truncate block">Material</span>
                      </th>
                      <th className="px-2 sm:px-3 py-2 text-left min-w-0">
                        <span className="truncate block">Sub Item</span>
                      </th>
                      <th className="px-2 sm:px-3 py-2 text-right">Weight</th>
                      <th className="px-2 sm:px-3 py-2 text-right rounded-tr-lg">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tender.materials.map((mat, idx) => (
                      <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-2 sm:px-3 py-2.5 font-medium min-w-0">
                          <span className="truncate block">{mat.material}</span>
                        </td>
                        <td className="px-2 sm:px-3 py-2.5 min-w-0">
                          <span className="truncate block">{mat.subMaterial || "-"}</span>
                        </td>
                        <td className="px-2 sm:px-3 py-2.5 text-right whitespace-nowrap">{mat.weight} MT</td>
                        <td className="px-2 sm:px-3 py-2.5 text-right whitespace-nowrap">{mat.quantity} pcs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Weight and Quantity Section */}
              <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 sm:p-4 shadow-sm border border-emerald-100 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-full shadow-sm flex-shrink-0">
                        <Scale className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">Total Weight</span>
                    </div>
                    <div className="bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm border border-emerald-100 flex-shrink-0">
                      <span className="text-emerald-700 font-bold text-xs sm:text-sm">{tender.totalWeight} MT</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-3 sm:p-4 shadow-sm border border-sky-100 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="bg-sky-100 p-1.5 sm:p-2 rounded-full shadow-sm flex-shrink-0">
                        <Package className="h-3 w-3 sm:h-4 sm:w-4 text-sky-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">Total Quantity</span>
                    </div>
                    <div className="bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm border border-sky-100 flex-shrink-0">
                      <span className="text-sky-700 font-bold text-xs sm:text-sm">{tender.totalQuantity} pcs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-3 rounded-lg text-center text-xs sm:text-sm">
              No materials added
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
            <span className="truncate">Selected Transporters</span>
          </h4>
          {tender.transporters?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tender.transporters.map((tid) => (
                <div
                  key={tid}
                  className="bg-indigo-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border border-indigo-100 shadow-sm min-w-0 max-w-full"
                >
                  <div className="bg-indigo-100 p-0.5 sm:p-1 rounded-full flex-shrink-0">
                    <Users className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-indigo-600" />
                  </div>
                  <span className="font-medium text-slate-700 truncate">{getTransporterName(tid)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-3 rounded-lg text-center text-xs sm:text-sm">
              No transporters selected
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TenderDetails
