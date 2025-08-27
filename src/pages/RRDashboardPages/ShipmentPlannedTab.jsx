import { useEffect, useState } from "react";
import {
  ChevronDown,
  MapPin,
  Calendar,
  FileText,
  Building2,
  Tag,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

import axios from "axios";
import API from "../../API";

const ShipmentPlannedTab = () => {
  const [shipments, setShipments] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toggle = (i) => setOpen((p) => (p === i ? null : i));

  const fetchPlanned = async () => {
    setLoading(true);
    setError(null);

    try {
      let res = await axios.get(`${API.SHIPMENT_DETAILS}?status=planned`, {
        withCredentials: true,
      });

      let data = Array.isArray(res.data) ? res.data : [];
      setShipments(data);
      // console.log("planned status : ", data);

    } catch (err) {
      console.error("Failed to fetch planned shipments:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not fetch planned shipment records. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanned();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-7 w-7" />
              Shipment Planned
            </h2>
            <button
              onClick={fetchPlanned}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white disabled:opacity-60"
              title="Refresh"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
          <p className="opacity-90 mt-2 text-sm sm:text-base">
            Read-only history of planned shipments. Tender creation is disabled here.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">Error loading planned shipments</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-10 text-center">
          <RefreshCcw className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Fetching Planned Shipments…</h3>
          <p className="text-slate-500">Please wait while we load your records.</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && shipments.length === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-10 text-center">
          <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Planned Shipments</h3>
          <p className="text-slate-500 text-sm">
            Shipments marked as planned will appear here.
          </p>
        </div>
      )}

      {/* Accordion list */}
      {!loading &&
        !error &&
        shipments.map((s, idx) => {
          const isOpen = open === idx;
          return (
            <div
              key={s._id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-slate-900 font-semibold text-base sm:text-lg">
                      {s.projectName}{" "}
                      <span className="text-slate-400 font-normal">·</span>{" "}
                      <span className="text-slate-600">{s.projectCode}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200 font-medium">
                      <Tag className="h-3.5 w-3.5" />
                      {s.status || "planned"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-4">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      {s.dispatchLocation}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      Planned:{" "}
                      <span className="font-medium text-slate-700">
                        {new Date(s.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 p-5 space-y-6 animate-fadeIn">
                  {/* Project */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="text-sm text-slate-500 mb-2 font-bold uppercase tracking-wide">
                        Project Details
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">
                          Project Name: <span className="font-semibold">{s.projectName}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Project Code: {s.projectCode}
                        </div>
                        <div className="text-xs text-slate-600">
                          Purchase Order: {s.purchaseOrder}
                        </div>
                      </div>
                      {s.projectRemark && (
                        <div className="mt-3 text-xs text-slate-600 flex items-start gap-2">
                          <FileText className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>
                            <span className="font-medium">Remark:</span> {s.projectRemark}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dispatch Location */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="text-sm text-slate-500 mb-2 font-bold uppercase tracking-wide">
                        Dispatch Location
                      </div>
                      <div className="text-slate-800 text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        Location: <span className="font-semibold">{s.dispatchLocation}</span>
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
                    This section is <span className="font-semibold">read-only</span>. You can
                    review planned shipments here. To create a tender, use the{" "}
                    <span className="font-medium text-slate-800">Shipment Details</span> tab.
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
