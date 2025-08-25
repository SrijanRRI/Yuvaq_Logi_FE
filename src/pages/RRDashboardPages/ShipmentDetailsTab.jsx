import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Calendar, Package, FileText, Building2 } from "lucide-react";

/**
 * For now, dummy data that matches exactly the fields you said you'll receive.
 * Replace with your API fetch later and keep the same shape.
 */
const useDummyShipments = () =>
  useMemo(
    () => [
      {
        _id: "68abf6aaeb2821aa2787d24a",
        leadId: "6810977295586c08fd98d249",
        projectName: "Rahul",
        projectCode: "123",
        purchaseOrder: "123",
        projectRemark: "123",
        dispatchLocation: "Bilaspur",
        address: "123",
        pincode: "123123",
        status: "created",
        createdBy: "64bf7283d86b3df7ef5277ff",
        createdAt: "2025-08-25T05:37:46.524Z",
        updatedAt: "2025-08-25T05:37:46.524Z",
      },
      {
        _id: "68abf6aaeb2821aa2787d24e",
        leadId: "6810977295586c08fd98d249",
        projectName: "srijan testing",
        projectCode: "123456",
        purchaseOrder: "123456",
        projectRemark: "123456",
        dispatchLocation: "Bilaspur",
        address: "123456",
        pincode: "123123",
        status: "created",
        createdBy: "64bf7283d86b3df7ef5277ff",
        createdAt: "2025-08-25T05:37:46.524Z",
        updatedAt: "2025-08-25T05:37:46.524Z",
      },
      {
        _id: "68abf6aaeb2821aa2787d24b",
        leadId: "6810977295586c08fd98d249",
        projectName: "Logistic Encoded",
        projectCode: "123",
        purchaseOrder: "123",
        projectRemark: "123",
        dispatchLocation: "Bilaspur",
        address: "123",
        pincode: "123123",
        status: "created",
        createdBy: "64bf7283d86b3df7ef5277ff",
        createdAt: "2025-08-25T05:37:46.524Z",
        updatedAt: "2025-08-25T05:37:46.524Z",
      },
    ],
    []
  );

const ShipmentDetailsTab = ({ onCreateFromShipment }) => {
  const shipments = useDummyShipments();
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen((p) => (p === i ? null : i));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Shipment Details
          </h2>
          <p className="opacity-90 mt-1">
            Click <span className="font-semibold">Create Tender</span> on any shipment to autofill the tender form.
          </p>
        </div>
      </div>

      {shipments.map((s, idx) => {
        const isOpen = open === idx;
        return (
          <div key={s._id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
            <button onClick={() => toggle(idx)} className="w-full text-left p-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-slate-900 font-semibold">{s.projectName} <span className="text-slate-400">·</span> <span className="text-slate-600">{s.projectCode}</span></div>
                <div className="mt-1 text-sm text-slate-600 flex flex-wrap gap-4">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-emerald-600" />{s.dispatchLocation}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4 text-emerald-600" />Created: {new Date(s.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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

                {/* Footer CTA */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-600" />
                    Use these details to create a tender.
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onCreateFromShipment(s)}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
                    >
                      Create Tender
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShipmentDetailsTab;
