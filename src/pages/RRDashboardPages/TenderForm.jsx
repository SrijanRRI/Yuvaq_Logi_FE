import {
  Calendar,
  MapPin,
  Package,
  FileText,
  Truck,
  Users,
  Plus,
  Trash2,
  Send,
  Briefcase,
  Scale,
  Info,
  ChevronDown,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import FullScreenLoader from "../../components/FullScreenLoader";
import API from "../../API";

const TenderForm = ({
  form,
  setForm,
  handleChange,
  handleSend,
  handleRemoveMaterial,
  setShowMaterialModal,
  setShowTransporterModal,
  selectedTransporters,
  loading,
  formDisabled,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [vehicleCatalog, setVehicleCatalog] = useState({});
  const [vehicleCatLoading, setVehicleCatLoading] = useState(false);
  const [vehicleCatError, setVehicleCatError] = useState("");

  const [vehCategory, setVehCategory] = useState("");
  const [vehVehicleId, setVehVehicleId] = useState("");
  const [vehQty, setVehQty] = useState(1);
  const [vehQtyError, setVehQtyError] = useState("");

  const validateVehQty = (raw) => {
    if (raw === "") return "Minimum 1 has to be present";
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return "Enter a valid quantity";
    if (n < 1) return "Minimum 1 has to be present";
    return "";
  };

  const openConfirmModal = (e) => {
    e?.preventDefault?.();
    if (loading || formDisabled) return;
    setShowConfirm(true);
  };

  const cancelConfirm = () => setShowConfirm(false);

  const agreeAndSubmit = async () => {
    setShowConfirm(false);
    await handleSend();
  };

  const unitOptions = [
    { value: "Per MT", label: "Per MT", description: "Price per metric ton" },
    {
      value: "Per Tender",
      label: "Per Tender",
      description: "Fixed price for entire tender",
    },
  ];

  const handleUnitSelect = (value) => {
    const event = {
      target: {
        name: "maxBidUnit",
        value,
      },
    };
    handleChange(event);
    setIsDropdownOpen(false);
  };

  const selectedOption = unitOptions.find(
    (option) => option.value === form.maxBidUnit,
  );

  // ---------------- PIN Auto-fill (Pickup + Drop) ----------------
  const [pickupPinStatus, setPickupPinStatus] = useState("idle"); // idle | loading | success | error
  const [pickupPinStatusMsg, setPickupPinStatusMsg] = useState("");
  const pickupLastPinRef = useRef(null);

  const [dropPinStatus, setDropPinStatus] = useState("idle"); // idle | loading | success | error
  const [dropPinStatusMsg, setDropPinStatusMsg] = useState("");
  const dropLastPinRef = useRef(null);

  const pickupManualRef = useRef({ state: false, district: false });
  const dropManualRef = useRef({ state: false, district: false });

  const normalizePin = (v) =>
    String(v ?? "")
      .trim()
      .replace(/\D/g, "")
      .slice(0, 6);

  const lookupPin = async (pin, signal) => {
    // 1) India Postal API
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
        signal,
        mode: "cors",
      });
      const json = await res.json();
      const d = Array.isArray(json) ? json[0] : null;

      if (d?.Status === "Success" && d?.PostOffice?.length) {
        const po = d.PostOffice[0];

        const state = po?.State || "";

        // ✅ Fill district only (best available)
        const district =
          po?.District ||
          po?.Block ||
          po?.Division ||
          po?.Taluk ||
          po?.Name ||
          "";

        return { state, district };
      }
    } catch {
      // fall through to zippopotam
    }

    // 2) Fallback: Zippopotam
    const res2 = await fetch(`https://api.zippopotam.us/IN/${pin}`, {
      signal,
      mode: "cors",
    });
    if (!res2.ok) throw new Error("PIN lookup failed");

    const j2 = await res2.json();
    const place = j2?.places?.[0];

    const state = place?.state || "";
    const district = place?.["place name"] || ""; // best available fallback

    return { state, district };
  };

  // Pickup PIN autofill
  useEffect(() => {
    const pin = normalizePin(form.pickup?.pincode);

    if (pin.length !== 6) {
      setPickupPinStatus("idle");
      setPickupPinStatusMsg("");
      pickupLastPinRef.current = null;
      return;
    }

    if (pickupLastPinRef.current === pin) return;

    const ctrl = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setPickupPinStatus("loading");
        setPickupPinStatusMsg("Looking up district & state…");

        const { state, district } = await lookupPin(pin, ctrl.signal);

        setForm((prev) => ({
          ...prev,
          pickup: {
            ...(prev.pickup || {}),
            pincode: pin,
            state: pickupManualRef.current.state ? (prev.pickup?.state || "") : state,
            district: pickupManualRef.current.district
              ? (prev.pickup?.district || "")
              : district,
            // city remains manual
          },
        }));

        setPickupPinStatus("success");
        setPickupPinStatusMsg(
          `${district}${district && state ? ", " : ""}${state}`,
        );
        pickupLastPinRef.current = pin;
      } catch (e) {
        if (e?.name === "AbortError") return;
        setPickupPinStatus("error");
        setPickupPinStatusMsg("Could not fetch details. Please fill manually.");
        pickupLastPinRef.current = null;
      }
    }, 350);

    return () => {
      ctrl.abort();
      clearTimeout(timeout);
    };
  }, [form.pickup?.pincode, setForm]);

  // Drop PIN autofill
  useEffect(() => {
    const pin = normalizePin(form.drop?.pincode);

    if (pin.length !== 6) {
      setDropPinStatus("idle");
      setDropPinStatusMsg("");
      dropLastPinRef.current = null;
      return;
    }

    if (dropLastPinRef.current === pin) return;

    const ctrl = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setDropPinStatus("loading");
        setDropPinStatusMsg("Looking up district & state…");

        const { state, district } = await lookupPin(pin, ctrl.signal);

        setForm((prev) => ({
          ...prev,
          drop: {
            ...(prev.drop || {}),
            pincode: pin,
            state: dropManualRef.current.state ? (prev.drop?.state || "") : state,
            district: dropManualRef.current.district
              ? (prev.drop?.district || "")
              : district,
            // city remains manual
          },
        }));

        setDropPinStatus("success");
        setDropPinStatusMsg(
          `${district}${district && state ? ", " : ""}${state}`,
        );
        dropLastPinRef.current = pin;
      } catch (e) {
        if (e?.name === "AbortError") return;
        setDropPinStatus("error");
        setDropPinStatusMsg("Could not fetch details. Please fill manually.");
        dropLastPinRef.current = null;
      }
    }, 350);

    return () => {
      ctrl.abort();
      clearTimeout(timeout);
    };
  }, [form.drop?.pincode, setForm]);

  // ---------------- Vehicle catalog ----------------
  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setVehicleCatLoading(true);
        setVehicleCatError("");

        const res = await fetch(API.VEHICLE_CATALOG, { credentials: "include" });
        const json = await res.json();

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Failed to fetch vehicle catalog");
        }

        if (!ignore) setVehicleCatalog(json.data || {});
      } catch (e) {
        if (!ignore) setVehicleCatError(e.message || "Vehicle catalog error");
      } finally {
        if (!ignore) setVehicleCatLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const addVehicleRequirement = () => {
    if (!vehCategory || !vehVehicleId) return;

    const list = vehicleCatalog?.[vehCategory] || [];
    const found = list.find((x) => String(x._id) === String(vehVehicleId));
    if (!found) return;

    const qtyNum = parseInt(vehQty, 10);
    if (!qtyNum || qtyNum < 1) {
      setVehQtyError("Minimum 1 has to be present");
      return;
    }
    const qty = qtyNum;

    setForm((prev) => {
      const existing = Array.isArray(prev.vehicleRequirements)
        ? prev.vehicleRequirements
        : [];
      const idx = existing.findIndex(
        (v) => String(v.vehicleId) === String(found._id),
      );

      if (idx >= 0) {
        const next = [...existing];
        next[idx] = {
          ...next[idx],
          quantity: Number(next[idx].quantity || 1) + qty,
        };
        return { ...prev, vehicleRequirements: next };
      }

      return {
        ...prev,
        vehicleRequirements: [
          ...existing,
          {
            vehicleId: found._id,
            category: vehCategory,
            subCategory: found.subCategory,
            quantity: qty,
          },
        ],
      };
    });

    setVehVehicleId("");
    setVehQty(1);
    setVehQtyError("");
    setVehCategory("");      // ✅ clear category
    setVehVehicleId("");     // ✅ clear vehicle
    setVehQty("1");          // reset qty
    setVehQtyError("");
  };

  const removeVehicleRequirement = (vehicleId) => {
    setForm((prev) => ({
      ...prev,
      vehicleRequirements: (prev.vehicleRequirements || []).filter(
        (v) => String(v.vehicleId) !== String(vehicleId),
      ),
    }));
  };

  const StatusLine = ({ status, msg }) => {
    if (!msg || status === "idle") return null;
    const dot =
      status === "loading"
        ? "bg-slate-400"
        : status === "success"
          ? "bg-emerald-500"
          : "bg-amber-500";
    const text =
      status === "loading"
        ? "text-slate-500"
        : status === "success"
          ? "text-emerald-700"
          : "text-amber-700";

    return (
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className={text}>{msg}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Create New Tender
          </h1>
          <p className="mt-1 opacity-80">
            Fill in the details to create a new tender request
          </p>
        </div>

        {loading ? (
          <FullScreenLoader />
        ) : (
          <form onSubmit={openConfirmModal} className="p-6">
            <fieldset disabled={formDisabled} className="space-y-8">
              {/* Delivery Window & Closing Date */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Delivery Window
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        name="deliveryStart"
                        value={form.deliveryWindow.from}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            deliveryWindow: {
                              ...prev.deliveryWindow,
                              from: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        name="deliveryEnd"
                        value={form.deliveryWindow.to}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            deliveryWindow: {
                              ...prev.deliveryWindow,
                              to: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Closing Date
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tender Closing Date
                    </label>
                    <input
                      type="date"
                      name="closingDate"
                      value={form.closingDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bidding Time */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Bidding Time
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bidding Start
                    </label>
                    <input
                      type="datetime-local"
                      name="biddingStart"
                      value={form.biddingStart || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Soft End (Shown to Transporter)
                    </label>
                    <input
                      type="datetime-local"
                      name="biddingEnd"
                      value={form.biddingEnd || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      If someone bids in the last 5 minutes, end time may extend (soft-close).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Hard Stop (Final End)
                    </label>
                    <input
                      type="datetime-local"
                      name="biddingHardEnd"
                      value={form.biddingHardEnd || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Optional. If empty, Hard Stop = Soft End (no extension).
                    </p>
                  </div>
                </div>
              </div>

              {/* Bid Amount Range (Min + Max) */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <Scale className="h-5 w-5 text-amber-600" />
                  Bid Amount Range
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-xl p-4 border border-amber-200 shadow-sm">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Minimum Bid Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-slate-500 text-lg">₹</span>
                      </div>
                      <input
                        type="number"
                        name="minBidAmount"
                        step="1"
                        min="0"
                        value={form.minBidAmount || ""}
                        onChange={handleChange}
                        placeholder="Enter minimum bid"
                        className="w-full pl-8 pr-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg font-medium transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-white/70 rounded-xl p-4 border border-amber-200 shadow-sm">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Maximum Bid Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-slate-500 text-lg">₹</span>
                      </div>
                      <input
                        type="number"
                        name="maxBidAmount"
                        step="1"
                        min="1"
                        value={form.maxBidAmount || ""}
                        onChange={handleChange}
                        placeholder="Enter maximum bid"
                        className="w-full pl-8 pr-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg font-medium transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Unit Dropdown */}
                <div className="relative mt-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit Type
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-white border border-amber-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-2 rounded-lg">
                            <Scale className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            {selectedOption ? (
                              <div>
                                <div className="font-medium text-slate-800">
                                  {selectedOption.label}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {selectedOption.description}
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-500">
                                Select Unit Type
                              </div>
                            )}
                          </div>
                        </div>

                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      </div>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-amber-200 rounded-lg shadow-lg overflow-hidden">
                        {unitOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleUnitSelect(option.value)}
                            className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors duration-150 border-b border-amber-100 last:border-b-0 focus:outline-none focus:bg-amber-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-2 rounded-lg">
                                  <Scale className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800">
                                    {option.label}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                              {form.maxBidUnit === option.value && (
                                <Check className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 text-amber-700">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">
                    Transporters must quote within the allowed range based on the
                    selected unit.
                  </p>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Project Details
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={form.projectName || ""}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Code
                    </label>
                    <input
                      type="text"
                      name="projectCode"
                      value={form.projectCode || ""}
                      onChange={handleChange}
                      placeholder="Enter project code"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Purchase Order
                    </label>
                    <input
                      type="text"
                      name="purchaseOrder"
                      value={form.purchaseOrder || ""}
                      onChange={handleChange}
                      placeholder="Enter purchase order"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Remark
                    </label>
                    <textarea
                      name="projectRemark"
                      value={form.projectRemark || ""}
                      onChange={handleChange}
                      placeholder="Enter project remarks or additional information"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-[60px] resize-none"
                    />
                  </div>
                </div>

                {/* Price Difference Rule */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Price Difference (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-slate-500">₹</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        name="priceDifference"
                        value={form.priceDifference}
                        onChange={handleChange}
                        placeholder="e.g., 20"
                        className="w-full pl-7 pr-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-emerald-50/40"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg shrink-0">
                          <Info className="h-4 w-4 text-emerald-700" />
                        </div>
                        <div className="text-sm text-emerald-800">
                          <p className="font-medium">
                            Minimum decrement to beat L1
                          </p>
                          <p className="mt-1">
                            Set the minimum amount (in ₹) by which a transporter
                            must undercut the current lowest bid (L1) for their
                            quote to be accepted. For example, if <b>L1 = ₹300</b>{" "}
                            and <b>Price Difference = ₹20</b>, then the next valid
                            quote must be <b>₹280 or lower</b>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup + Drop Location Details */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Pickup & Drop Location Details
                </h2>
                <p className="text-xs text-slate-500 mb-5">
                  Enter PIN Code to auto-fill{" "}
                  <span className="font-medium">City</span> &{" "}
                  <span className="font-medium">State</span>. You can
                  edit anytime.
                </p>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* ---------------- Pickup ---------------- */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-semibold text-slate-800 mb-3">
                      Pickup
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          value={form.pickup?.pincode || ""}
                          onChange={(e) => {
                            const pin = e.target.value.replace(/\D/g, "").slice(0, 6);

                            // PIN changed → allow autofill overwrite for new PIN
                            pickupManualRef.current = { state: false, district: false };

                            setForm((prev) => ({
                              ...prev,
                              pickup: {
                                ...(prev.pickup || {}),
                                pincode: pin,

                                // optional but recommended: clear old auto-filled values while typing new PIN
                                state: "",
                                district: "",
                              },
                            }));
                          }}
                          placeholder="6-digit PIN"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                        <StatusLine
                          status={pickupPinStatus}
                          msg={pickupPinStatusMsg}
                        />
                      </div>

                      <div className="md:col-span-8">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={form.pickup?.state || ""}
                          onChange={(e) => {
                            pickupManualRef.current.state = true; // ✅ user edited manually
                            setForm((prev) => ({
                              ...prev,
                              pickup: {
                                ...(prev.pickup || {}),
                                state: e.target.value,
                              },
                            }));
                          }}
                          placeholder="Auto-filled or type manually"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={form.pickup?.district || ""}
                          onChange={(e) => {
                            pickupManualRef.current.district = true; // ✅ user edited manually
                            setForm((prev) => ({
                              ...prev,
                              pickup: {
                                ...(prev.pickup || {}),
                                district: e.target.value,
                              },
                            }));
                          }}
                          placeholder="Auto-filled or type manually"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          City / Town
                        </label>
                        <input
                          type="text"
                          value={form.pickup?.city || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              pickup: {
                                ...(prev.pickup || {}),
                                city: e.target.value,
                              },
                            }))
                          }
                          placeholder="Enter the city"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="md:col-span-12">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Exact Pickup Address / Location
                        </label>
                        <textarea
                          value={form.pickup?.address || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              pickup: {
                                ...(prev.pickup || {}),
                                address: e.target.value,
                              },
                            }))
                          }
                          placeholder="Enter full address / landmark / exact pickup location"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 min-h-[90px] resize-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* ---------------- Drop ---------------- */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-semibold text-slate-800 mb-3">
                      Drop
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          value={form.drop?.pincode || ""}
                          onChange={(e) => {
                            const pin = e.target.value.replace(/\D/g, "").slice(0, 6);

                            dropManualRef.current = { state: false, district: false };

                            setForm((prev) => ({
                              ...prev,
                              drop: {
                                ...(prev.drop || {}),
                                pincode: pin,
                                state: "",
                                district: "",
                              },
                            }));
                          }}
                          placeholder="6-digit PIN"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                        <StatusLine status={dropPinStatus} msg={dropPinStatusMsg} />
                      </div>

                      <div className="md:col-span-8">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={form.drop?.state || ""}
                          onChange={(e) => {
                            dropManualRef.current.state = true;
                            setForm((prev) => ({
                              ...prev,
                              drop: {
                                ...(prev.drop || {}),
                                state: e.target.value,
                              },
                            }));
                          }}
                          placeholder="Auto-filled or type manually"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={form.drop?.district || ""}
                          onChange={(e) => {
                            dropManualRef.current.district = true;
                            setForm((prev) => ({
                              ...prev,
                              drop: {
                                ...(prev.drop || {}),
                                district: e.target.value,
                              },
                            }));
                          }}
                          placeholder="Auto-filled or type manually"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          City / Town
                        </label>
                        <input
                          type="text"
                          value={form.drop?.city || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              drop: {
                                ...(prev.drop || {}),
                                city: e.target.value,
                              },
                            }))
                          }
                          placeholder="Enter the city"
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="md:col-span-12">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Exact Drop Address / Location
                        </label>
                        <textarea
                          value={form.drop?.address || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              drop: {
                                ...(prev.drop || {}),
                                address: e.target.value,
                              },
                            }))
                          }
                          placeholder="Enter full address / landmark / exact drop location"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 min-h-[90px] resize-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Requirements Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    Vehicle Requirements
                  </h2>
                </div>

                {vehicleCatError ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
                    {vehicleCatError}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                  <div className="lg:col-span-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={vehCategory}
                      onChange={(e) => {
                        setVehCategory(e.target.value);
                        setVehVehicleId("");
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Category</option>
                      {Object.keys(vehicleCatalog || {}).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vehicle
                    </label>
                    <select
                      value={vehVehicleId}
                      onChange={(e) => setVehVehicleId(e.target.value)}
                      disabled={!vehCategory}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">
                        {vehCategory ? "Select Vehicle" : "Select Category first"}
                      </option>
                      {(vehicleCatalog?.[vehCategory] || []).map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.subCategory}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Qty
                    </label>

                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={vehQty}
                      onChange={(e) => {
                        const raw = e.target.value; // can be "" while typing
                        setVehQty(raw);
                        setVehQtyError(validateVehQty(raw));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${vehQtyError ? "border-red-400" : "border-slate-300"
                        }`}
                    />

                    {vehQtyError ? (
                      <p className="mt-1 text-xs text-red-600">{vehQtyError}</p>
                    ) : null}
                  </div>

                  <div className="lg:col-span-1">
                    <button
                      type="button"
                      onClick={addVehicleRequirement}
                      disabled={
                        !vehCategory ||
                        !vehVehicleId ||
                        vehicleCatLoading ||
                        vehQty === "" ||
                        !!vehQtyError
                      }
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {(form.vehicleRequirements || []).length > 0 ? (
                  <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left bg-slate-100 text-slate-700 font-semibold rounded-tl-lg">
                              Category
                            </th>
                            <th className="px-4 py-3 text-left bg-slate-100 text-slate-700 font-semibold">
                              Vehicle
                            </th>
                            <th className="px-4 py-3 text-right bg-slate-100 text-slate-700 font-semibold">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-center bg-slate-100 text-slate-700 font-semibold rounded-tr-lg">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.vehicleRequirements.map((v) => (
                            <tr
                              key={String(v.vehicleId)}
                              className="border-b border-slate-200 last:border-0 hover:bg-slate-100/50 transition"
                            >
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {v.category}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {v.subCategory}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-700">
                                {v.quantity}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeVehicleRequirement(v.vehicleId)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition"
                                  title="Remove"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
                        <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                          <Scale className="h-4 w-4 text-emerald-600" />
                          Total Weight (MT)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={form.weight}
                          onChange={handleChange}
                          placeholder="Total weight"
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 text-emerald-800 font-medium transition-all duration-200"
                          required
                        />
                      </div>

                      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100 shadow-sm">
                        <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-sky-600" />
                          Total Quantity
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={form.quantity}
                          onChange={handleChange}
                          placeholder="Total quantity"
                          className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white/80 text-sky-800 font-medium transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-slate-600 font-medium">No vehicles added yet</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Select a category, vehicle and quantity, then click Add.
                    </p>
                  </div>
                )}
              </div>

              {/* Transporters Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    Transporters
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowTransporterModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Select Transporters
                  </button>
                </div>

                {selectedTransporters.length > 0 ? (
                  <div className="bg-slate-50 rounded-xl p-5 mb-4 border border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {selectedTransporters.map((transporter, index) => (
                        <div
                          key={transporter._id}
                          className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-200"
                        >
                          <div className="bg-emerald-100 p-1.5 rounded-full">
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <span className="font-medium text-slate-700">
                            Transporter {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center mb-4">
                    <div className="bg-white rounded-full p-4 inline-flex mb-3 shadow-sm">
                      <Truck className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium mb-2">
                      No transporters selected
                    </p>
                    <p className="text-slate-500 text-sm mb-4">
                      Select transporters who can bid on this tender
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowTransporterModal(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 inline-flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Select Transporters
                    </button>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  placeholder="Add any additional information or special instructions"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[120px] transition-all duration-200"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-lg font-medium"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" /> Submit Tender
                    </>
                  )}
                </button>
              </div>
            </fieldset>
          </form>
        )}

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-800 text-white">
                <h3 className="text-lg font-bold">Confirm Tender Submission</h3>
                <p className="text-white/90 text-sm mt-1">
                  Please read the caution and terms before submitting.
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-900 font-semibold mb-2">
                    Caution
                  </p>
                  <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1">
                    <li>
                      Verify all tender details (dates, location, materials,
                      weight/quantity, remarks) before submitting.
                    </li>
                    <li>
                      Once submitted, transporters may start bidding immediately
                      based on the details you entered.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-900 font-semibold mb-2">
                    Terms & Disclaimer
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>
                      YuvaQ is a technology platform that facilitates tender
                      creation and bidding.
                    </li>
                    <li>
                      YuvaQ does not verify, guarantee, or take responsibility
                      for tender accuracy or outcomes.
                    </li>
                    <li>
                      Any transporter backout, delay, dispute, or
                      non-performance is between the tender creator and
                      transporter.
                    </li>
                    <li>
                      YuvaQ is not responsible for any loss, damage, or claims
                      arising from bidding, backout, or fulfillment issues.
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={cancelConfirm}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={agreeAndSubmit}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-60"
                  >
                    I Agree & Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderForm;