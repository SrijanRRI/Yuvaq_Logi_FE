import { useState, useMemo } from "react";
import { Briefcase, Package, Scale, Users, Calendar, MapPin, FileText, Clock, Sparkles, Info, Truck } from "lucide-react";

const MAX_VISIBLE_TRANSPORTERS = 10;

const TenderDetails = ({ tender, getTransporterName }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateWithTime = (dateStr) => {
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  };

  const moneyIN = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : "-";
  };

  const unitDesc =
    tender.maxBidUnit === "Per MT"
      ? "Price per metric ton"
      : tender.maxBidUnit === "Per Tender"
        ? "Fixed price for entire tender"
        : "";

  const transporters = tender.transporters || [];

  const isTenderFinalized =
    String(tender?.status || "").toLowerCase() === "finalized";

  const getSelectedTransporterLabel = (tid, index) => {
    if (!isTenderFinalized) {
      return `Transporter ${index + 1}`;
    }

    return (
      getTransporterName?.(tid, tender, index) ||
      `Transporter ${index + 1}`
    );
  };

  const materials = Array.isArray(tender.materials) ? tender.materials : [];

  const [showAllTransporters, setShowAllTransporters] = useState(false);

  const totalHidden = Math.max(transporters.length - MAX_VISIBLE_TRANSPORTERS, 0);

  const visibleTransporters = useMemo(() => {
    if (showAllTransporters) return transporters;
    return transporters.slice(0, MAX_VISIBLE_TRANSPORTERS);
  }, [showAllTransporters, transporters]);

  const hiddenCountDisplay = !showAllTransporters ? totalHidden : 0;

  const softEnd = tender.biddingSoftEnd || tender.biddingEnd;
  const hardEnd = tender.biddingHardEnd || softEnd;
  const effectiveEnd = tender.biddingEnd;
  const wasExtended =
    softEnd && effectiveEnd && new Date(effectiveEnd).getTime() !== new Date(softEnd).getTime();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="space-y-4 sm:space-y-5">
        {(tender.projectName || tender.projectCode || tender.purchaseOrder) && (
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm sm:text-base font-semibold text-slate-700 flex items-center gap-2">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
                <span className="truncate text-pretty">Project Details</span>
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                <Sparkles className="h-3 w-3" />
                Insight
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
              {tender.projectName && (
                <div className="min-w-0">
                  <span className="text-xs text-slate-500 block mb-1">Project Name</span>
                  <p className="font-medium text-slate-800 text-sm sm:text-base break-words text-pretty">
                    {tender.projectName}
                  </p>
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
                  <p className="font-medium text-slate-800 text-sm sm:text-base break-words text-pretty">
                    {tender.purchaseOrder}
                  </p>
                </div>
              )}
            </div>
            {tender.projectRemark && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">Remark</span>
                <p className="text-slate-700 text-xs sm:text-sm break-words text-pretty">{tender.projectRemark}</p>
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
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Closing Date</span>
            </h4>
            <p className="font-medium text-slate-800 text-xs sm:text-sm">{formatDate(tender.closeDate)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex-shrink-0">
                <Clock className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="truncate">Bidding Window</span>
            </h4>

            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] sm:text-xs font-semibold text-indigo-700 border border-indigo-100">
              Time
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="text-[11px] sm:text-xs text-slate-500 mb-1">Start</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 break-words">
                {tender.biddingStart ? formatDateWithTime(tender.biddingStart) : "-"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="text-[11px] sm:text-xs text-slate-500 mb-1">Soft End</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 break-words">
                {softEnd ? formatDateWithTime(softEnd) : "-"}
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="text-[11px] sm:text-xs text-slate-500 mb-1">Hard Stop</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 break-words">
                {hardEnd ? formatDateWithTime(hardEnd) : "-"}
              </div>
            </div>
          </div>

          {wasExtended && (
            <div className="mt-2 text-xs text-emerald-700">
              Effective End (auto-extended): <b>{formatDateWithTime(effectiveEnd)}</b>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-xs sm:text-sm font-medium text-amber-700 mb-2 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
              <span className="truncate">Bid Details</span>
            </h4>

            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] sm:text-xs font-semibold text-amber-700 border border-amber-200">
              Limits
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* <div className="rounded-lg border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-3">
              <div className="text-[11px] sm:text-xs text-slate-600 mb-1">Minimum Bid</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 break-words">
                {moneyIN(tender.minBidAmount)}
              </div>
            </div>

            <div className="rounded-lg border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-3">
              <div className="text-[11px] sm:text-xs text-slate-600 mb-1">Maximum Bid</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 break-words">
                {moneyIN(tender.maxBidAmount)}
              </div>
            </div> */}

            <div className="rounded-lg border border-amber-100 bg-white p-3">
              <div className="text-[11px] sm:text-xs text-slate-600 mb-1">Unit Type</div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {tender.maxBidUnit || "-"}
                </div>

                {tender.maxBidUnit && (
                  <span className="shrink-0 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] sm:text-xs font-semibold border border-amber-200">
                    Unit
                  </span>
                )}
              </div>

              {unitDesc && (
                <div className="mt-1 text-[11px] sm:text-xs text-slate-500 leading-snug">
                  {unitDesc}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 sm:col-span-2">
            <h4 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Pickup & Drop</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Pickup</div>

                <p className="text-slate-800 text-xs sm:text-sm font-medium break-words text-pretty">
                  {tender.pickup?.address || "Not specified"}
                </p>

                <p className="mt-1 text-[11px] sm:text-xs text-slate-600 break-words">
                  {[tender.pickup?.district || tender.pickup?.city, tender.pickup?.state]
                    .filter(Boolean)
                    .join(", ")}
                  {tender.pickup?.pincode ? ` - ${tender.pickup.pincode}` : ""}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Drop</div>

                <p className="text-slate-800 text-xs sm:text-sm font-medium break-words text-pretty">
                  {tender.drop?.address || "Not specified"}
                </p>

                <p className="mt-1 text-[11px] sm:text-xs text-slate-600 break-words">
                  {[tender.drop?.district || tender.drop?.city, tender.drop?.state]
                    .filter(Boolean)
                    .join(", ")}
                  {tender.drop?.pincode ? ` - ${tender.drop.pincode}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {tender.remarks && (
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Remarks</span>
            </h4>
            <p className="text-slate-700 bg-slate-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm break-words text-pretty">
              {tender.remarks}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-sm sm:text-base font-semibold text-slate-700 flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
              <span className="truncate text-pretty">Materials</span>
            </h4>
            {materials.length > 0 && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {materials.length} item{materials.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map((m, idx) => (
                <div
                  key={`${m.hsnDigits || m.hsnCode}-${idx}`}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] sm:text-xs text-slate-500">HSN</div>
                      <div className="font-semibold text-slate-800">
                        {m.hsnCode || m.hsnDigits || "-"}
                      </div>
                    </div>
                    {m.quantity != null && (
                      <div className="text-right">
                        <div className="text-[11px] sm:text-xs text-slate-500">Qty</div>
                        <div className="font-semibold text-slate-800">
                          {m.quantity} {m.unit || ""}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-sm font-medium text-slate-800 break-words">
                    {m.materialName || "-"}
                  </div>

                  {m.remarks && (
                    <div className="mt-2 text-xs text-slate-500 break-words">
                      Remarks: {m.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-3 rounded-lg text-center text-xs sm:text-sm">
              No materials added
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
            <span className="truncate text-pretty">Vehicle Requirements</span>
          </h4>

          {tender.vehicleRequirements?.length > 0 ? (
            <div>
              <div className="block sm:hidden space-y-3">
                {tender.vehicleRequirements.map((v, idx) => (
                  <div
                    key={String(v.vehicleId || idx)}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-100"
                  >
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2">
                        <span className="text-slate-500 block mb-1">Category</span>
                        <p className="font-medium text-slate-800 break-words">{v.category || "-"}</p>
                      </div>

                      <div className="col-span-2">
                        <span className="text-slate-500 block mb-1">Vehicle</span>
                        <p className="text-slate-700 break-words">{v.subCategory || "-"}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-1">Qty</span>
                        <p className="font-medium text-slate-800">{v.quantity ?? "-"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-3 py-2 text-left rounded-tl-xl min-w-0">
                        <span className="truncate block">Category</span>
                      </th>
                      <th className="px-3 py-2 text-left min-w-0">
                        <span className="truncate block">Vehicle</span>
                      </th>
                      <th className="px-3 py-2 text-right rounded-tr-xl">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tender.vehicleRequirements.map((v, idx) => (
                      <tr
                        key={String(v.vehicleId || idx)}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-3 py-2.5 font-medium min-w-0">
                          <span className="truncate block">{v.category || "-"}</span>
                        </td>
                        <td className="px-3 py-2.5 min-w-0">
                          <span className="truncate block">{v.subCategory || "-"}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {v.quantity ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                      <span className="text-emerald-700 font-bold text-xs sm:text-sm">
                        {tender.totalWeight != null ? `${tender.totalWeight} MT` : "-"}
                      </span>
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
                      <span className="text-sky-700 font-bold text-xs sm:text-sm">
                        {tender.totalQuantity != null ? `${tender.totalQuantity} pcs` : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-3 rounded-lg text-center text-xs sm:text-sm">
              No vehicle requirements added
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="text-xs sm:text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Price Difference Rule</span>
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-slate-800 text-xs sm:text-sm">
              Minimum decrement required to beat the current lowest bid.
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 font-semibold whitespace-nowrap">
              ₹{tender.priceDifference != null ? Number(tender.priceDifference).toLocaleString() : "-"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h4 className="text-sm sm:text-base font-semibold text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
              <span className="truncate">Selected Transporters</span>
            </h4>
            {transporters.length > 0 && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {transporters.length} transporter{transporters.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {transporters.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {visibleTransporters.map((tid, index) => (
                  <div
                    key={tid}
                    className="group bg-indigo-50 px-3 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-2 border border-indigo-100 shadow-sm min-w-0 max-w-full transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="bg-indigo-100 p-1 rounded-full flex-shrink-0">
                      <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-600" />
                    </div>
                    <span className="font-medium text-slate-700 truncate text-pretty">
                      {getSelectedTransporterLabel(tid, index)}
                    </span>
                  </div>
                ))}

                {hiddenCountDisplay > 0 && (
                  <div className="px-3 py-2 rounded-lg border border-dashed border-indigo-200 bg-white text-xs sm:text-sm font-medium text-indigo-500 shadow-sm">
                    +{hiddenCountDisplay} more
                  </div>
                )}
              </div>

              {totalHidden > 0 && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllTransporters((prev) => !prev)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition
                      ${showAllTransporters
                        ? "border-indigo-200 bg-white text-indigo-700 hover:bg-slate-50"
                        : "border-indigo-200 bg-indigo-600 text-white hover:bg-indigo-700"}`}
                    aria-expanded={showAllTransporters}
                  >
                    <Sparkles className="h-4 w-4" />
                    {showAllTransporters ? "Show fewer transporters" : "Show all transporters"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-3 rounded-lg text-center text-xs sm:text-sm">
              No transporters selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenderDetails;