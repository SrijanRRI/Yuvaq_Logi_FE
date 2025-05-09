import { Briefcase, Package, Scale, Users } from "lucide-react";

const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });

const formatDateWithTime = (dateStr) => {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  const timePart = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${datePart}, ${timePart}`;
};


const TenderDetails = ({ tender, getTransporterName }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* Left Column */}
      <div className="space-y-4">
        {(tender.projectName || tender.projectCode || tender.purchaseOrder) && (
          <div>
            <h4 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Briefcase className="h-4 w-4 text-emerald-600" /> Project Details
            </h4>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                {tender.projectName && <div><span className="text-xs text-slate-500">Project Name:</span><p className="font-medium text-slate-800">{tender.projectName}</p></div>}
                {tender.projectCode && <div><span className="text-xs text-slate-500">Project Code:</span><p className="font-medium text-slate-800">{tender.projectCode}</p></div>}
                {tender.purchaseOrder && <div><span className="text-xs text-slate-500">Purchase Order:</span><p className="font-medium text-slate-800">{tender.purchaseOrder}</p></div>}
              </div>
              {tender.projectRemark && <div className="mt-2"><span className="text-xs text-slate-500">Remark:</span><p className="text-slate-700 text-sm">{tender.projectRemark}</p></div>}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-1">Delivery Window</h4>
          <p className="font-medium text-slate-800">
            {tender.deliveryWindow?.from && tender.deliveryWindow?.to ? `${formatDate(tender.deliveryWindow.from)} to ${formatDate(tender.deliveryWindow.to)}` : "Not specified"}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-1">Bidding Window</h4>
          <p className="font-medium text-slate-800">
            {tender.biddingStart && tender.biddingEnd
              ? `${formatDateWithTime(tender.biddingStart)} to ${formatDateWithTime(tender.biddingEnd)}`
              : "Not specified"}
          </p>
        </div>

        <div><h4 className="text-sm font-medium text-slate-500 mb-1">Closing Date</h4><p className="font-medium text-slate-800">{formatDate(tender.closeDate)}</p></div>
        <div><h4 className="text-sm font-medium text-slate-500 mb-1">Location</h4><p className="text-slate-800">{tender.dispatchLocation}, {tender.address}, {tender.pincode}</p></div>

        {tender.remarks && <div><h4 className="text-sm font-medium text-slate-500 mb-1">Remarks</h4><p className="text-slate-800 bg-slate-50 p-2 rounded-md">{tender.remarks}</p></div>}
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-1">Materials</h4>
          {tender.materials?.length > 0 ? (
            <div className="bg-slate-50 rounded-lg p-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-600">
                    <th className="px-2 py-1 text-left">Material</th>
                    <th className="px-2 py-1 text-left">Sub Item</th>
                    <th className="px-2 py-1 text-right">Weight</th>
                    <th className="px-2 py-1 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {tender.materials.map((mat, idx) => (
                    <tr key={idx} className="border-t border-slate-200">
                      <td className="px-2 py-1.5 font-medium">{mat.material}</td>
                      <td className="px-2 py-1.5">{mat.subMaterial || "-"}</td>
                      <td className="px-2 py-1.5 text-right">{mat.weight} MT</td>
                      <td className="px-2 py-1.5 text-right">{mat.quantity} pcs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 italic">No materials added</p>
          )}

          {/* Redesigned Total Weight and Quantity Section */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 shadow-sm border border-emerald-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <Scale className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Total Weight</span>
                </div>
                <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="text-emerald-700 font-bold">{tender.totalWeight} MT</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 shadow-sm border border-sky-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-sky-100 p-2 rounded-full">
                    <Package className="h-5 w-5 text-sky-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Total Quantity</span>
                </div>
                <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="text-sky-700 font-bold">{tender.totalQuantity} pcs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-500 mb-1">Selected Transporters</h4>
          {tender.transporters?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tender.transporters.map((tid) => (
                <div key={tid} className="bg-slate-100 px-3 py-1 rounded-md text-sm flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  {getTransporterName(tid)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No transporters selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenderDetails;