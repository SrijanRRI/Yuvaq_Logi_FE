import { useState, useEffect, useMemo } from "react";
import { Truck, X, Check, Search, Loader2, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import axios from "axios";
import API from "../API";

const authCfg = () => {
  const token = localStorage.getItem("session_token");
  return {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 15000,
  };
};

const statusMeta = (matchType) => {
  if (matchType === "full") {
    return {
      text: "Eligible",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ShieldCheck,
    };
  }

  if (matchType === "partial") {
    return {
      text: "Partial Match",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
    };
  }

  return {
    text: "No Match",
    cls: "bg-slate-100 text-slate-700 border-slate-200",
    icon: ShieldAlert,
  };
};

const TransporterModal = ({
  selected = [],
  vehicleRequirements = [],
  onClose,
  onSave,
  setTransporterList: updateParentTransporterList,
}) => {
  const [transporterList, setTransporterList] = useState([]);
  const [localSelection, setLocalSelection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchEligibleTransporters = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          API.ELIGIBLE_TRANSPORT_USERS,
          {
            vehicleRequirements: Array.isArray(vehicleRequirements)
              ? vehicleRequirements
              : [],
          },
          authCfg()
        );

        const data = Array.isArray(response?.data?.data) ? response.data.data : [];

        if (ignore) return;

        setTransporterList(data);
        updateParentTransporterList?.(data);

        if (Array.isArray(selected) && selected.length > 0) {
          setLocalSelection(selected.map(String));
        } else {
          const autoSelected = data
            .filter((t) => t.defaultSelected)
            .map((t) => String(t._id));
          setLocalSelection(autoSelected);
        }
      } catch (error) {
        console.error("Failed to fetch eligible transporters:", error);
        setTransporterList([]);
        updateParentTransporterList?.([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchEligibleTransporters();

    return () => {
      ignore = true;
    };
  }, [selected, updateParentTransporterList, JSON.stringify(vehicleRequirements)]);

  const handleCheckboxChange = (transporterId) => {
    const id = String(transporterId);

    // Eligible transporters must always stay selected.
    if (eligibleTransporterIds.includes(id)) return;

    setLocalSelection((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const eligibleTransporterIds = useMemo(() => {
    return transporterList
      .filter((t) => t.matchType === "full" || t.eligible || t.defaultSelected)
      .map((t) => String(t._id));
  }, [transporterList]);

  const manualReviewTransporterIds = useMemo(() => {
    return transporterList
      .filter((t) => !(t.matchType === "full" || t.eligible || t.defaultSelected))
      .map((t) => String(t._id));
  }, [transporterList]);

  const isAllManualReviewSelected =
    manualReviewTransporterIds.length > 0 &&
    manualReviewTransporterIds.every((id) => localSelection.includes(id));

  const handleSelectAllTransporters = () => {
    if (isAllManualReviewSelected) {
      // Deselect Manual Review only. Eligible will remain selected.
      setLocalSelection(eligibleTransporterIds);
      return;
    }

    // Select Eligible + all Manual Review.
    setLocalSelection([
      ...new Set([...eligibleTransporterIds, ...manualReviewTransporterIds]),
    ]);
  };

  const handleSave = () => {
    onSave(localSelection);
    onClose();
  };

  const demoLabelById = useMemo(() => {
    const map = {};
    transporterList.forEach((t, idx) => {
      map[t._id] = `Transporter ${idx + 1}`;
    });
    return map;
  }, [transporterList]);

  const filteredTransporters = transporterList.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const demoLabel = (demoLabelById[t._id] || "").toLowerCase();

    return (
      demoLabel.includes(q) ||
      String(t.name || "").toLowerCase().includes(q) ||
      String(t.email || "").toLowerCase().includes(q) ||
      String(t.summary || "").toLowerCase().includes(q)
    );
  });

  const eligibleCount = transporterList.filter((t) => t.eligible).length;
  const partialCount = transporterList.filter((t) => t.matchType === "partial").length;
  const noMatchCount = transporterList.filter((t) => t.matchType === "none").length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Select Transporters
              </h2>
              <p className="text-white/85 text-sm mt-1">
                Eligible transporters are auto-selected. You can still manually choose others.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search transporters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
              <div className="text-emerald-700 font-semibold">{eligibleCount}</div>
              <div className="text-emerald-600 text-xs">Eligible</div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <div className="text-amber-700 font-semibold">{partialCount + noMatchCount}</div>
              <div className="text-amber-600 text-xs">Manual Review</div>
            </div>
          </div>
        </div> */}

        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
              <div className="text-emerald-700 font-semibold">{eligibleCount}</div>
              <div className="text-emerald-600 text-xs">Eligible</div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <div className="text-amber-700 font-semibold">
                {partialCount + noMatchCount}
              </div>
              <div className="text-amber-600 text-xs">Manual Review</div>
            </div>

            <button
              type="button"
              onClick={handleSelectAllTransporters}
              disabled={loading || manualReviewTransporterIds.length === 0}
              className={`px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-2 shadow-sm text-sm border ${isAllManualReviewSelected
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
             >
              <span
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isAllManualReviewSelected
                  ? "bg-white border-white"
                  : "bg-white border-slate-300"
                  }`}
              >
                {isAllManualReviewSelected ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : null}
              </span>

              Select Manual Review
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-3" />
              <p className="text-slate-600">Checking transporter eligibility...</p>
            </div>
          ) : filteredTransporters.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-slate-50 rounded-full p-4 inline-flex mb-3">
                <Truck className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No transporters found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransporters.map((transporter) => {
                const id = String(transporter._id);
                const checked = localSelection.includes(id);
                const meta = statusMeta(transporter.matchType);
                const Icon = meta.icon;
                const isEligibleLocked = eligibleTransporterIds.includes(id);

                return (
                  <label
                    key={id}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition ${isEligibleLocked ? "cursor-not-allowed" : "cursor-pointer"
                      } ${checked
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                  >
                    <div className="relative flex items-center justify-center pt-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange(id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded transition-all duration-200 border flex items-center justify-center ${checked
                          ? "bg-emerald-600 border-emerald-600"
                          : "bg-white border-slate-300"
                          }`}
                      >
                        {checked ? <Check className="h-3.5 w-3.5 text-white" /> : null}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="font-medium text-slate-800">
                            {demoLabelById[transporter._id] || "Transporter"}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Match {Number(transporter.matchedCount || 0)}/
                            {Number(transporter.requiredCount || 0)}
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.cls}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {meta.text}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        {transporter.summary || "No summary available"}
                      </div>

                      {Array.isArray(transporter.missingVehicles) && transporter.missingVehicles.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {transporter.missingVehicles.map((v, idx) => (
                            <span
                              key={`${id}-missing-${idx}`}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-red-50 text-red-700 border border-red-200"
                            >
                              Missing: {v.subCategory} ({v.ownedQty}/{v.requiredQty})
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Selected: <span className="font-semibold text-slate-900">{localSelection.length}</span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium flex items-center gap-2 shadow-sm"
              >
                <Check className="h-4 w-4" /> Save Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterModal;