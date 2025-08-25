import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Calendar, FileText, Building2, Tag } from "lucide-react";

/**
 * Dummy planned shipments (same shape as your Shipment Details).
 * Replace with API later, keep the same fields.
 */
const useDummyPlannedShipments = () =>
  useMemo(
    () => [
      {
        _id: "plan-01",
        projectName: "Planned Alpha",
        projectCode: "PLA-001",
        purchaseOrder: "PO-PLA-001",
        projectRemark: "Night dispatch preferred.",
        dispatchLocation: "RR ISPAT Plant 1",
        address: "Urla Industrial Estate, Raipur, Chhattisgarh",
        pincode: "492003",
        status: "planned",
        createdAt: "2025-08-22T09:15:00.000Z",
      },
      {
        _id: "plan-02",
        projectName: "Planned Beta",
        projectCode: "PLB-014",
        purchaseOrder: "PO-PLB-014",
        projectRemark: "Covered trucks recommended.",
        dispatchLocation: "Central Yard",
        address: "Ring Road No.1, Raipur, Chhattisgarh",
        pincode: "492001",
        status: "planned",
        createdAt: "2025-08-23T11:30:00.000Z",
      },
      {
        _id: "plan-03",
        projectName: "Planned Gamma",
        projectCode: "PLG-233",
        purchaseOrder: "PO-PLG-233",
        projectRemark: "Bridge permit will be required.",
        dispatchLocation: "Plant 2",
        address: "Industrial Area, Siltara, Raipur, Chhattisgarh",
        pincode: "493111",
        status: "planned",
        createdAt: "2025-08-24T16:10:00.000Z",
      },
    ],
    []
  );

const ShipmentPlannedTab = () => {
  // note: we accept onCreateFromShipment in parent, but intentionally don't use it (read-only view)
  const shipments = useDummyPlannedShipments();
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen((p) => (p === i ? null : i));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Shipment Planned
          </h2>
          <p className="opacity-90 mt-1">
            Read-only history of planned shipments. Tender creation is disabled here.
          </p>
        </div>
      </div>

      {/* Accordion list */}
      {shipments.map((s, idx) => {
        const isOpen = open === idx;
        return (
          <div
            key={s._id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full text-left p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-slate-900 font-semibold">
                    {s.projectName} <span className="text-slate-400">·</span>{" "}
                    <span className="text-slate-600">{s.projectCode}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200">
                    <Tag className="h-3.5 w-3.5" />
                    {s.status || "planned"}
                  </span>
                </div>

                <div className="mt-1 text-sm text-slate-600 flex flex-wrap gap-4">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    {s.dispatchLocation}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    Planned: {new Date(s.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="border-t border-slate-200 p-5 space-y-6 animate-fadeIn">
                {/* Project */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">Project</div>
                    <div className="font-medium text-slate-900">{s.projectName}</div>
                    <div className="text-xs text-slate-500 mt-1">Code: {s.projectCode}</div>
                    <div className="text-xs text-slate-500">PO: {s.purchaseOrder}</div>
                    {s.projectRemark && (
                      <div className="mt-2 text-xs text-slate-600 flex items-start gap-2">
                        <FileText className="h-4 w-4 text-emerald-600 mt-0.5" />
                        {s.projectRemark}
                      </div>
                    )}
                  </div>

                  {/* Dispatch Location */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">Dispatch Location</div>
                    <div className="text-slate-800 text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      {s.dispatchLocation}
                    </div>
                    <div className="text-slate-800 text-sm mt-1">
                      Address: <span className="font-medium">{s.address}</span>
                    </div>
                    <div className="text-slate-800 text-sm">
                      Pincode: <span className="font-medium">{s.pincode}</span>
                    </div>
                  </div>
                </div>

                {/* Read-only note */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  This section is read-only. You can review planned shipments here.
                  To create a tender, use the <span className="font-medium text-slate-800">Shipment Details</span> tab.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShipmentPlannedTab;
