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
  Search,
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
  setShowTransporterModal,
  selectedTransporters,
  loading,
  formDisabled,
  onClearForm,
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

  const [hsnInput, setHsnInput] = useState("");
  const [hsnLookupLoading, setHsnLookupLoading] = useState(false);
  const [hsnLookupError, setHsnLookupError] = useState("");
  const [hsnLookupData, setHsnLookupData] = useState(null);
  const [materialQty, setMaterialQty] = useState("");
  const [materialUnit, setMaterialUnit] = useState("");
  const [materialRemarks, setMaterialRemarks] = useState("");
  const hsnReqRef = useRef(0);

  const validateVehQty = (raw) => {
    if (raw === "") return "Minimum 1 has to be present";
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return "Enter a valid quantity";
    if (n < 1) return "Minimum 1 has to be present";
    return "";
  };

  const normalizeHsn = (value = "") =>
    String(value).replace(/\D/g, "").trim();

  const openConfirmModal = (e) => {
    e?.preventDefault?.();
    if (loading || formDisabled) return;
    if (hardEndBeforeSoftEnd) return;
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

  const BID_AMOUNT_RANGE_BY_UNIT = {
    "Per MT": {
      minBidAmount: "0",
      maxBidAmount: "9999",
    },
    "Per Tender": {
      minBidAmount: "0",
      maxBidAmount: "400000",
    },
  };

  // const handleUnitSelect = (value) => {
  //   const event = {
  //     target: {
  //       name: "maxBidUnit",
  //       value,
  //     },
  //   };
  //   handleChange(event);
  //   setIsDropdownOpen(false);
  // };

  const handleUnitSelect = (value) => {
    const range = BID_AMOUNT_RANGE_BY_UNIT[value];

    setForm((prev) => ({
      ...prev,
      maxBidUnit: value,
      minBidAmount: range?.minBidAmount || "",
      maxBidAmount: range?.maxBidAmount || "",
    }));

    setIsDropdownOpen(false);
  };

  const selectedOption = unitOptions.find(
    (option) => option.value === form.maxBidUnit,
  );

  const parseDateTimeLocal = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const softEndDate = parseDateTimeLocal(form.biddingEnd);
  const hardEndDate = parseDateTimeLocal(form.biddingHardEnd);

  const hardEndBeforeSoftEnd =
    !!form.biddingEnd &&
    !!form.biddingHardEnd &&
    !!softEndDate &&
    !!hardEndDate &&
    hardEndDate < softEndDate;

  const lookupHsn = async (rawCode) => {
    const code = normalizeHsn(rawCode);
    if (code.length < 4) {
      setHsnLookupData(null);
      setHsnLookupError("");
      return;
    }

    const reqId = ++hsnReqRef.current;

    try {
      setHsnLookupLoading(true);
      setHsnLookupError("");

      const token = localStorage.getItem("session_token");
      const res = await fetch(`${API.HSN_LOOKUP}/${encodeURIComponent(code)}`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();

      if (reqId !== hsnReqRef.current) return;

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "HSN code not found");
      }

      setHsnLookupData(json.data || null);
    } catch (e) {
      if (reqId !== hsnReqRef.current) return;
      setHsnLookupData(null);
      setHsnLookupError(e?.message || "HSN code not found");
    } finally {
      if (reqId === hsnReqRef.current) setHsnLookupLoading(false);
    }
  };

  const clearPickupOnly = () => {
    pickupManualRef.current = { state: false, district: false };
    pickupLastPinRef.current = null;

    setPickupPinStatus("idle");
    setPickupPinStatusMsg("");

    setForm((prev) => ({
      ...prev,
      pickup: {
        pincode: "",
        state: "",
        district: "",
        city: "",
        location: "",
        address: "",
        country: "India",
      },
    }));
  };

  useEffect(() => {
    const code = normalizeHsn(hsnInput);

    if (code.length < 4) {
      setHsnLookupData(null);
      setHsnLookupError("");
      setHsnLookupLoading(false);
      return;
    }

    const t = setTimeout(() => {
      lookupHsn(code);
    }, 400);

    return () => clearTimeout(t);
  }, [hsnInput]);

  const addMaterialFromLookup = () => {
    if (!hsnLookupData) {
      setHsnLookupError("Enter a valid HSN code first");
      return;
    }

    let qty = null;
    if (materialQty !== "") {
      qty = Number(materialQty);
      if (!Number.isFinite(qty) || qty < 0) {
        setHsnLookupError("Material quantity must be a valid number");
        return;
      }
    }

    const nextMaterial = {
      hsnCode: hsnLookupData.codeDisplay || hsnLookupData.codeDigits,
      hsnDigits: hsnLookupData.codeDigits,
      materialName: hsnLookupData.description,
      quantity: qty,
      unit: materialUnit.trim(),
      remarks: materialRemarks.trim(),
    };

    setForm((prev) => {
      const existingMaterials = [...(prev.materials || [])];

      const normalizeHsnValue = (value) => String(value || "").replace(/\D/g, "");
      const normalizeUnitValue = (value) => String(value || "").trim().toLowerCase();

      const nextHsn = normalizeHsnValue(nextMaterial.hsnDigits || nextMaterial.hsnCode);
      const nextUnit = normalizeUnitValue(nextMaterial.unit);

      const existingIndex = existingMaterials.findIndex((m) => {
        const rowHsn = normalizeHsnValue(m.hsnDigits || m.hsnCode);
        return rowHsn === nextHsn;
      });

      // no existing same HSN -> add normally
      if (existingIndex === -1) {
        return {
          ...prev,
          materials: [...existingMaterials, nextMaterial],
        };
      }

      const existing = existingMaterials[existingIndex];
      const existingUnit = normalizeUnitValue(existing.unit);

      // same HSN but different non-empty unit -> do not merge
      if (existingUnit && nextUnit && existingUnit !== nextUnit) {
        setHsnLookupError(
          `Same HSN already exists with unit "${existing.unit}". Please use same unit to merge quantity.`
        );
        return prev;
      }

      const oldQty =
        existing.quantity === null || existing.quantity === undefined || existing.quantity === ""
          ? 0
          : Number(existing.quantity);

      const newQty =
        nextMaterial.quantity === null ||
          nextMaterial.quantity === undefined ||
          nextMaterial.quantity === ""
          ? 0
          : Number(nextMaterial.quantity);

      const mergedRemarks = [existing.remarks, nextMaterial.remarks]
        .map((x) => String(x || "").trim())
        .filter(Boolean);

      existingMaterials[existingIndex] = {
        ...existing,
        quantity:
          oldQty === 0 && newQty === 0
            ? null
            : oldQty + newQty,
        unit: existing.unit || nextMaterial.unit,
        remarks: [...new Set(mergedRemarks)].join(" | "),
      };

      return {
        ...prev,
        materials: existingMaterials,
      };
    });

    setHsnInput("");
    setHsnLookupData(null);
    setHsnLookupError("");
    setMaterialQty("");
    setMaterialUnit("");
    setMaterialRemarks("");
  };

  // ---------------- PIN Auto-fill (Pickup + Drop) ----------------
  const [pickupPinStatus, setPickupPinStatus] = useState("idle");
  const [pickupPinStatusMsg, setPickupPinStatusMsg] = useState("");
  const pickupLastPinRef = useRef(null);

  const [dropPinStatus, setDropPinStatus] = useState("idle");
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
        const district =
          po?.District ||
          po?.Block ||
          po?.Division ||
          po?.Taluk ||
          po?.Name ||
          "";

        return { state, district };
      }
    } catch { }

    const res2 = await fetch(`https://api.zippopotam.us/IN/${pin}`, {
      signal,
      mode: "cors",
    });
    if (!res2.ok) throw new Error("PIN lookup failed");

    const j2 = await res2.json();
    const place = j2?.places?.[0];

    const state = place?.state || "";
    const district = place?.["place name"] || "";

    return { state, district };
  };

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

    setVehCategory("");
    setVehVehicleId("");
    setVehQty("1");
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

  const RequiredAsterisk = () => (
    <span className="ml-1 text-red-500">*</span>
  );

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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6" />
                Create New Tender
              </h1>
              <p className="mt-1 opacity-80">
                Fill in the details to create a new tender request
              </p>
            </div>

            <button
              type="button"
              onClick={onClearForm}
              disabled={loading || formDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/25 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Clear Form
            </button>
          </div>
        </div>

        {loading ? (
          <FullScreenLoader />
        ) : (
          <form onSubmit={openConfirmModal} className="p-6">
            <fieldset disabled={formDisabled} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Delivery Window
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        From<RequiredAsterisk />
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        To<RequiredAsterisk />
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      Tender Closing Date<RequiredAsterisk />
                    </label>
                    <input
                      type="date"
                      name="closingDate"
                      value={form.closingDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Bidding Time
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bidding Start<RequiredAsterisk />
                    </label>
                    <input
                      type="datetime-local"
                      name="biddingStart"
                      value={form.biddingStart || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Soft End (Shown to Transporter)<RequiredAsterisk />
                    </label>
                    <input
                      type="datetime-local"
                      name="biddingEnd"
                      value={form.biddingEnd || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      If someone bids in the last 5 minutes, end time may extend.
                    </p>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Hard Stop (Final End)
                    </label>
                    <input
                      type="datetime-local"
                      name="biddingHardEnd"
                      value={form.biddingHardEnd || ""}
                      min={form.biddingEnd || undefined}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${hardEndBeforeSoftEnd
                        ? "border-red-400 focus:ring-red-500"
                        : "border-slate-300 focus:ring-emerald-500"
                        }`}
                    />
                    {hardEndBeforeSoftEnd ? (
                      <p className="mt-1 text-xs text-red-600">
                        Hard Stop must be greater than or equal to Soft End.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        Optional. If empty, Hard Stop = Soft End.
                      </p>
                    )}
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Hard Stop (Final End)
                    </label>

                    <input
                      type="datetime-local"
                      name="biddingHardEnd"
                      value={form.biddingHardEnd || form.biddingEnd || ""}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed focus:outline-none"
                    />

                    <p className="mt-1 text-xs text-slate-500">
                      Hard Stop is disabled. It will follow Soft End by default.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <Scale className="h-5 w-5 text-amber-600" />
                  Bid Amount Range
                </h2>

                <div className="space-y-5">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Unit Type<RequiredAsterisk />
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-white border border-amber-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
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
                                <div className="text-slate-500">Select Unit Type</div>
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
                              className="w-full px-4 py-3 text-left hover:bg-amber-50 border-b border-amber-100 last:border-b-0"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-xl p-4 border border-amber-200 shadow-sm">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Minimum Bid Amount<RequiredAsterisk />
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-slate-500 text-lg">₹</span>
                        </div>

                        {/* <input
                        type="number"
                        name="minBidAmount"
                        value={form.minBidAmount || ""}
                        readOnly
                        placeholder="Select Unit Type first"
                        className="w-full pl-8 pr-3 py-3 border border-amber-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed focus:outline-none text-lg font-medium"
                        required
                      /> */}

                        <input
                          type="number"
                          name="minBidAmount"
                          value={form.minBidAmount || ""}
                          onChange={handleChange}
                          min="0"
                          placeholder="Enter minimum amount"
                          className="w-full pl-8 pr-3 py-3 border border-amber-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-white/70 rounded-xl p-4 border border-amber-200 shadow-sm">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Maximum Bid Amount<RequiredAsterisk />
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-slate-500 text-lg">₹</span>
                        </div>

                        {/* <input
                        type="number"
                        name="maxBidAmount"
                        value={form.maxBidAmount || ""}
                        readOnly
                        placeholder="Select Unit Type first"
                        className="w-full pl-8 pr-3 py-3 border border-amber-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed focus:outline-none text-lg font-medium"
                        required
                      /> */}

                        <input
                          type="number"
                          name="maxBidAmount"
                          value={form.maxBidAmount || ""}
                          onChange={handleChange}
                          min="0"
                          placeholder="Enter maximum amount"
                          className="w-full pl-8 pr-3 py-3 border border-amber-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-amber-700">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs">
                      Transporters must quote within the allowed range based on the selected unit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Project Details
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Name<RequiredAsterisk />
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={form.projectName || ""}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Code<RequiredAsterisk />
                    </label>
                    <input
                      type="text"
                      name="projectCode"
                      value={form.projectCode || ""}
                      onChange={handleChange}
                      placeholder="Enter project code"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Purchase Order<RequiredAsterisk />
                    </label>
                    <input
                      type="text"
                      name="purchaseOrder"
                      value={form.purchaseOrder || ""}
                      onChange={handleChange}
                      placeholder="Enter purchase order"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Remark<RequiredAsterisk />
                    </label>
                    <textarea
                      name="projectRemark"
                      value={form.projectRemark || ""}
                      onChange={handleChange}
                      placeholder="Enter project remarks or additional information"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-[60px] resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Price Difference (₹)<RequiredAsterisk />
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-slate-500">₹</span>
                      </div>

                      <input
                        type="text"
                        inputMode="numeric"
                        name="priceDifference"
                        value={form.priceDifference ?? ""}
                        onChange={handleChange}
                        onBlur={() => {
                          const n = parseInt(form.priceDifference, 10);

                          if (!Number.isFinite(n) || n < 25) {
                            setForm((prev) => ({
                              ...prev,
                              priceDifference: "25",
                            }));
                          }
                        }}
                        placeholder="Minimum ₹25"
                        className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-emerald-50/40 ${form.priceDifference !== "" &&
                          Number(form.priceDifference) < 25
                          ? "border-red-300 focus:ring-red-400"
                          : "border-emerald-200 focus:ring-emerald-500"
                          }`}
                        required
                      />
                    </div>

                    {form.priceDifference !== "" && Number(form.priceDifference) < 25 ? (
                      <p className="mt-1 text-xs text-red-600">
                        Minimum allowed price difference is ₹25.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-emerald-700">
                        Default is ₹25. You can edit it to ₹25 or more.
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg shrink-0">
                          <Info className="h-4 w-4 text-emerald-700" />
                        </div>

                        <div className="text-sm text-emerald-800">
                          <p className="font-medium">Minimum decrement to beat L1</p>
                          <p className="mt-1">
                            This amount controls how much lower the next bid must be compared
                            to the current lowest bid. You can change it, but it must be at
                            least ₹25.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Materials with HSN */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    Materials
                  </h2>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        HSN Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={hsnInput}
                          onChange={(e) => setHsnInput(e.target.value)}
                          placeholder="Enter HSN code"
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      {hsnLookupLoading && (
                        <p className="mt-1 text-xs text-slate-500">Fetching material details…</p>
                      )}
                      {!hsnLookupLoading && hsnLookupError && (
                        <p className="mt-1 text-xs text-red-600">{hsnLookupError}</p>
                      )}
                    </div>

                    <div className="lg:col-span-5">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Material Description
                      </label>
                      <div className="min-h-[42px] px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700">
                        {hsnLookupData ? (
                          <div>
                            <div className="font-medium text-slate-800">
                              {hsnLookupData.description}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              HSN: {hsnLookupData.codeDisplay || hsnLookupData.codeDigits}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Lookup result will appear here</span>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={materialQty}
                        onChange={(e) => setMaterialQty(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={materialUnit}
                        onChange={(e) => setMaterialUnit(e.target.value)}
                        placeholder="MT / Bags / Nos"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="lg:col-span-10">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Material Remarks
                      </label>
                      <input
                        type="text"
                        value={materialRemarks}
                        onChange={(e) => setMaterialRemarks(e.target.value)}
                        placeholder="Optional remarks for this material"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <button
                        type="button"
                        onClick={addMaterialFromLookup}
                        disabled={!hsnLookupData}
                        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        Add Material
                      </button>
                    </div>
                  </div>
                </div>

                {(form.materials || []).length > 0 ? (
                  <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="overflow-x-auto hidden sm:block">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left bg-slate-100 text-slate-700 font-semibold rounded-tl-lg">
                              HSN
                            </th>
                            <th className="px-4 py-3 text-left bg-slate-100 text-slate-700 font-semibold">
                              Material
                            </th>
                            <th className="px-4 py-3 text-right bg-slate-100 text-slate-700 font-semibold">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-left bg-slate-100 text-slate-700 font-semibold">
                              Unit
                            </th>
                            <th className="px-4 py-3 text-left bg-slate-100 text-slate-700 font-semibold">
                              Remarks
                            </th>
                            <th className="px-4 py-3 text-center bg-slate-100 text-slate-700 font-semibold rounded-tr-lg">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.materials.map((m, idx) => (
                            <tr
                              key={`${m.hsnDigits}-${idx}`}
                              className="border-b border-slate-200 last:border-0 hover:bg-slate-100/50 transition"
                            >
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {m.hsnCode || m.hsnDigits}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {m.materialName}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-700">
                                {m.quantity ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {m.unit || "-"}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {m.remarks || "-"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMaterial(idx)}
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

                    <div className="sm:hidden space-y-3">
                      {form.materials.map((m, idx) => (
                        <div
                          key={`${m.hsnDigits}-${idx}`}
                          className="rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs text-slate-500">HSN</div>
                              <div className="font-semibold text-slate-800">
                                {m.hsnCode || m.hsnDigits}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(idx)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 text-sm text-slate-700">{m.materialName}</div>
                          <div className="mt-2 text-xs text-slate-500">
                            Qty: {m.quantity ?? "-"} {m.unit || ""}
                          </div>
                          {m.remarks && (
                            <div className="mt-1 text-xs text-slate-500">Remarks: {m.remarks}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-slate-600 font-medium">No materials added yet</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Enter HSN code to auto-fetch material details, then add it to the tender.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Pickup & Drop Location Details
                </h2>
                <p className="text-xs text-slate-500 mb-5">
                  Enter PIN Code to auto-fill district & state. You can edit anytime.
                </p>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    {/* <div className="font-semibold text-slate-800 mb-3">Pickup<RequiredAsterisk /></div> */}

                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="font-semibold text-slate-800">
                          Pickup<RequiredAsterisk />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Default RR ISPAT address is auto-filled. You can edit it or enter a new address.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={clearPickupOnly}
                        disabled={loading || formDisabled}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Clear only pickup address fields"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Enter New Address
                      </button>
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

                            pickupManualRef.current = { state: false, district: false };

                            setForm((prev) => ({
                              ...prev,
                              pickup: {
                                ...(prev.pickup || {}),
                                pincode: pin,
                                state: "",
                                district: "",
                              },
                            }));
                          }}
                          placeholder="6-digit PIN"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                        <StatusLine status={pickupPinStatus} msg={pickupPinStatusMsg} />
                      </div>

                      <div className="md:col-span-8">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={form.pickup?.state || ""}
                          onChange={(e) => {
                            pickupManualRef.current.state = true;
                            setForm((prev) => ({
                              ...prev,
                              pickup: {
                                ...(prev.pickup || {}),
                                state: e.target.value,
                              },
                            }));
                          }}
                          placeholder="Auto-filled or type manually"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            pickupManualRef.current.district = true;
                            setForm((prev) => ({
                              ...prev,
                              pickup: {
                                ...(prev.pickup || {}),
                                district: e.target.value,
                              },
                            }));
                          }}
                          placeholder="Auto-filled or type manually"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[90px] resize-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <div className="font-semibold text-slate-800 mb-3">
                      Pickup<RequiredAsterisk />
                    </div>

                    <div className="mb-4 rounded-lg border font-bold border-emerald-200 bg-white/80 p-3 text-sm text-emerald-800">
                      RR ISPAT
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          value={form.pickup?.pincode || ""}
                          readOnly
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                          required
                        />
                      </div>

                      <div className="md:col-span-8">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={form.pickup?.state || ""}
                          readOnly
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                        />
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={form.pickup?.district || ""}
                          readOnly
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                        />
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          City / Town
                        </label>
                        <input
                          type="text"
                          value={form.pickup?.city || ""}
                          readOnly
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                          required
                        />
                      </div>

                      <div className="md:col-span-12">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Exact Pickup Address / Location
                        </label>
                        <textarea
                          value={form.pickup?.address || ""}
                          readOnly
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed min-h-[90px] resize-none"
                          required
                        />
                      </div>
                    </div>
                  </div> */}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-semibold text-slate-800 mb-3">Drop<RequiredAsterisk /></div>

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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[90px] resize-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Requirements */}
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
                      Category<RequiredAsterisk />
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
                      Vehicle<RequiredAsterisk />
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
                      Qty<RequiredAsterisk />
                    </label>

                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={vehQty}
                      onChange={(e) => {
                        const raw = e.target.value;
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
                          Total Weight (MT)<RequiredAsterisk />
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={form.weight}
                          onChange={handleChange}
                          placeholder="Total weight"
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/80 text-emerald-800 font-medium"
                          required
                        />
                      </div>

                      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100 shadow-sm">
                        <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-sky-600" />
                          Total Quantity<RequiredAsterisk />
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={form.quantity}
                          onChange={handleChange}
                          placeholder="Total quantity"
                          className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white/80 text-sky-800 font-medium"
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

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    Transporters<RequiredAsterisk />
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
                            {transporter.anonymousLabel || `Transporter ${index + 1}`}
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                />
              </div>

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
                      Verify all tender details including HSN materials, vehicle requirements, dates and locations.
                    </li>
                    <li>
                      Once submitted, transporters may start bidding immediately.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-900 font-semibold mb-2">
                    Terms & Disclaimer
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>
                      YuvaQ is a technology platform that facilitates tender creation and bidding.
                    </li>
                    <li>
                      YuvaQ does not verify, guarantee, or take responsibility for tender accuracy or outcomes.
                    </li>
                    <li>
                      Any transporter backout, delay, dispute, or non-performance is between the tender creator and transporter.
                    </li>
                    <li>
                      YuvaQ is not responsible for any loss, damage, or claims arising from bidding, backout, or fulfillment issues.
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