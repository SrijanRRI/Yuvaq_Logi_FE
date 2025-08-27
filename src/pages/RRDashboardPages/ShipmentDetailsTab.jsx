import { useEffect, useState, useRef } from "react"
import { ChevronDown, MapPin, Calendar, Package, FileText, Building2 } from "lucide-react"
import axios from "axios";
import API from "../../API";

const ShipmentDetailsTab = ({ isActive = false, onCreateFromShipment }) => {
  const [shipments, setShipments] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false); // to avoid refetching every time user re-clicks tab
  const [error, setError] = useState(null);

  const controllerRef = useRef(null);

  const toggle = (i) => setOpen((p) => (p === i ? null : i));

  const fetchShipments = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API.SHIPMENT_DETAILS}?status=created`, {
        withCredentials: true,
      });

      // Expecting an array like in your example
      const data = Array.isArray(res.data) ? res.data : [];

      setShipments(data);
      setLoadedOnce(true);

      // console.log("created status: ", data);

    } catch (err) {
      if (axios.isCancel(err)) return; // user navigated away quickly
      console.error("Failed to fetch shipments:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not fetch shipment records. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when the tab becomes active the first time
  useEffect(() => {
    if (isActive && !loadedOnce) {
      fetchShipments();
    }
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="h-7 w-7" />
            Your Shipment Records
          </h2>
          <p className="opacity-95 mt-2 text-emerald-50">
            View all your shipment details below. Click on any shipment to see complete information and use the{" "}
            <span className="font-semibold bg-white/20 px-2 py-1 rounded text-white">Create Tender</span> button to
            automatically fill tender forms with shipment data.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <div className="font-semibold">Error loading shipments</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-lg font-medium text-slate-600 mb-1">Fetching Shipments…</h3>
          <p className="text-slate-500">Please wait while we load your records.</p>
        </div>
      )}

      {!loading && !error && shipments.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Shipments Found</h3>
          <p className="text-slate-500">Your shipment records will appear here once they are created.</p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Package className="h-5 w-5" />
              <span className="font-medium">
                Showing {shipments.length} shipment{shipments.length !== 1 ? "s" : ""} available for tender creation
              </span>
            </div>
          </div>

          {shipments.map((s, idx) => {
            const isOpen = open === idx
            return (
              <div
                key={s._id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{s.projectName}</h3>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                        Code: {s.projectCode}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Dispatch from:</span> {s.dispatchLocation}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(s.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 hidden sm:block">
                      {isOpen ? "Hide Details" : "View Details"}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 bg-slate-50">
                    <div className="p-6 space-y-6">
                      {/* Project Information Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          Project Information
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Project Name
                              </label>
                              <p className="text-slate-900 font-medium mt-1">{s.projectName}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Project Code
                              </label>
                              <p className="text-slate-900 font-medium mt-1">{s.projectCode}</p>
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Purchase Order 
                              </label>
                              <p className="text-slate-900 font-medium mt-1">{s.purchaseOrder}</p>
                            </div>
                          </div>
                          {s.projectRemark && (
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Project Remark
                              </label>
                              <p className="text-slate-700 mt-1 bg-slate-50 p-3 rounded border">{s.projectRemark}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Information Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          Shipping & Dispatch Information
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Dispatch Location
                            </label>
                            <p className="text-slate-900 font-medium mt-1">{s.dispatchLocation}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Complete Address
                            </label>
                            <p className="text-slate-700 mt-1">{s.address}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Postal Code
                            </label>
                            <p className="text-slate-900 font-medium mt-1">{s.pincode}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Section */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                          <div>
                            <h5 className="font-medium text-emerald-800 mb-1">Ready to Create Tender?</h5>
                            <p className="text-sm text-emerald-700">
                              Use this shipment's information to automatically populate a new tender form with all the
                              details above.
                            </p>
                          </div>
                          <button
                            onClick={() => onCreateFromShipment(s)}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium flex items-center gap-2 justify-center sm:justify-start whitespace-nowrap"
                          >
                            <Package className="h-4 w-4" />
                            Create Tender
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default ShipmentDetailsTab
