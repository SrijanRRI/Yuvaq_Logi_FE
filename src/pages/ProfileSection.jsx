import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  BadgeCheck,
  Calendar,
  CreditCard,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ClipboardList,
  Copy,
  Truck,
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  Clock3,
  XCircle,
  PackagePlus,
} from "lucide-react";
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

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const safe = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

const roleLabel = (role) => {
  if (role === "transportUser") return "Transport User";
  if (role === "admin") return "Admin";
  return "RR User";
};

const StatusBadge = ({ active, text }) => (
  <span
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-amber-50 text-amber-700 border-amber-200"
    }`}
  >
    <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
    {text}
  </span>
);

const FleetStatusBadge = ({ status }) => {
  const map = {
    approved: {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ShieldCheck,
      text: "Approved",
    },
    pending: {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
      text: "Pending",
    },
    rejected: {
      cls: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
      text: "Rejected",
    },
  };

  const meta = map[status] || map.pending;
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.text}
    </span>
  );
};

const StatTile = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-xs font-medium text-slate-500">{label}</div>
    <div className="mt-1 text-lg font-bold text-slate-900 break-words">{value}</div>
  </div>
);

const InfoTile = ({ icon: Icon, label, value, mono = false, onCopy }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
          <Icon className="h-4 w-4 text-emerald-600" />
        </span>
        <span>{label}</span>
      </div>

      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
          title={`Copy ${label}`}
        >
          <Copy className="h-4 w-4 text-slate-500" />
        </button>
      ) : null}
    </div>

    <div
      className={`mt-3 break-words text-slate-900 font-semibold ${
        mono ? "font-mono text-xs" : "text-sm"
      }`}
    >
      {value}
    </div>
  </div>
);

export default function ProfileSection({ fallbackUser = null }) {
  const [profile, setProfile] = useState(fallbackUser || null);
  const [loading, setLoading] = useState(!fallbackUser);
  const [refreshing, setRefreshing] = useState(false);

  const [fleet, setFleet] = useState([]);
  const [fleetSummary, setFleetSummary] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [fleetLoading, setFleetLoading] = useState(false);

  const [vehicleCatalog, setVehicleCatalog] = useState({});
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCatalogVehicleId, setSelectedCatalogVehicleId] = useState("");
  const [catalogQty, setCatalogQty] = useState(1);
  const [addingCatalog, setAddingCatalog] = useState(false);

  const [customVehicle, setCustomVehicle] = useState({
    group: "",
    category: "",
    subCategory: "",
    quantityOwned: 1,
  });
  const [requestingCustom, setRequestingCustom] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [fleetFilter, setFleetFilter] = useState("all");
  const [fleetSearch, setFleetSearch] = useState("");

  const copyText = async (text, label = "Text") => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  const isTransportUser = (profile?.role || fallbackUser?.role) === "transportUser";
  const subscription = profile?.subscription || {};

  const isSubActive = useMemo(() => {
    if (typeof subscription?.isActive === "boolean") return subscription.isActive;
    if (subscription?.status !== "active") return false;
    if (!subscription?.endsAt) return true;
    return new Date(subscription.endsAt) > new Date();
  }, [subscription]);

  const loadProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axios.get(API.GET_MY_PROFILE, authCfg());
      setProfile(res?.data?.data || null);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFleet = async () => {
    try {
      setFleetLoading(true);
      const res = await axios.get(API.GET_MY_FLEET, authCfg());
      setFleet(res?.data?.data || []);
      setFleetSummary(
        res?.data?.summary || {
          approved: 0,
          pending: 0,
          rejected: 0,
        }
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load fleet.");
      setFleet([]);
      setFleetSummary({ approved: 0, pending: 0, rejected: 0 });
    } finally {
      setFleetLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      setCatalogLoading(true);
      const res = await axios.get(API.VEHICLE_CATALOG, authCfg());
      const data = res?.data?.data || {};
      setVehicleCatalog(data);

      if (!selectedCategory && Object.keys(data).length > 0) {
        setSelectedCategory(Object.keys(data)[0]);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load vehicle catalog.");
      setVehicleCatalog({});
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (isTransportUser) {
      loadFleet();
      loadCatalog();
    }
  }, [isTransportUser]);

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      await loadProfile(true);
      if (isTransportUser) {
        await Promise.all([loadFleet(), loadCatalog()]);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const addCatalogVehicle = async () => {
    if (!selectedCatalogVehicleId) {
      toast.error("Please select a vehicle from catalog.");
      return;
    }

    try {
      setAddingCatalog(true);
      await axios.post(
        API.ADD_CATALOG_VEHICLE_TO_FLEET,
        {
          catalogVehicleId: selectedCatalogVehicleId,
          quantityOwned: Number(catalogQty || 1),
        },
        authCfg()
      );

      toast.success("Vehicle added to your fleet.");
      setSelectedCategory("");
      setSelectedCatalogVehicleId("");
      setCatalogQty(1);
      await loadFleet();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add vehicle.");
    } finally {
      setAddingCatalog(false);
    }
  };

  const submitCustomRequest = async () => {
    if (!customVehicle.category?.trim() || !customVehicle.subCategory?.trim()) {
      toast.error("Category and vehicle name are required.");
      return;
    }

    try {
      setRequestingCustom(true);
      await axios.post(
        API.ADD_CUSTOM_VEHICLE_REQUEST,
        {
          group: customVehicle.group?.trim() || "",
          category: customVehicle.category?.trim(),
          subCategory: customVehicle.subCategory?.trim(),
          quantityOwned: Number(customVehicle.quantityOwned || 1),
        },
        authCfg()
      );

      toast.success("Custom vehicle request submitted.");
      setCustomVehicle({
        group: "",
        category: "",
        subCategory: "",
        quantityOwned: 1,
      });
      await loadFleet();
      await loadCatalog();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit custom request.");
    } finally {
      setRequestingCustom(false);
    }
  };

  const deleteFleetVehicle = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(API.DELETE_FLEET_VEHICLE(id), authCfg());
      toast.success("Vehicle removed from fleet.");
      await loadFleet();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove vehicle.");
    } finally {
      setDeletingId("");
    }
  };

  const categoryOptions = Object.keys(vehicleCatalog || {});
  const selectedVehicles = selectedCategory ? vehicleCatalog[selectedCategory] || [] : [];

  const filteredFleet = (fleet || []).filter((item) => {
    const matchesStatus = fleetFilter === "all" ? true : item.status === fleetFilter;
    const q = fleetSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(item.category || "").toLowerCase().includes(q) ||
      String(item.subCategory || "").toLowerCase().includes(q) ||
      String(item.group || "").toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  if (loading && !profile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
        <RefreshCcw className="h-8 w-8 mx-auto text-emerald-600 animate-spin" />
        <div className="mt-3 text-slate-900 font-semibold">Loading profile...</div>
        <div className="text-sm text-slate-500 mt-1">Fetching your account details</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white">
          <div className="absolute top-0 right-0 h-48 w-48 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-black/10 rounded-full blur-2xl translate-y-8 -translate-x-4" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>

              <div>
                <div className="text-2xl md:text-3xl font-bold">{safe(profile?.name)}</div>
                <div className="mt-1 text-white/90 text-sm">{roleLabel(profile?.role)}</div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    active={!!profile?.isApproved}
                    text={profile?.isApproved ? "Account Approved" : "Approval Pending"}
                  />
                  <StatusBadge
                    active={isSubActive}
                    text={isSubActive ? "Subscription Active" : "Subscription Inactive"}
                  />
                  {isTransportUser ? <StatusBadge active text="Fleet Enabled" /> : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={refreshAll}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatTile label="Email" value={safe(profile?.email)} />
            <StatTile label="Phone" value={safe(profile?.phone)} />
            <StatTile label="Current Plan" value={safe(subscription?.plan || "No Plan")} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Account Details
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoTile icon={User} label="Role" value={roleLabel(profile?.role)} />

              <InfoTile
                icon={Mail}
                label="Email Address"
                value={safe(profile?.email)}
                onCopy={() => copyText(profile?.email, "Email")}
              />

              <InfoTile
                icon={Phone}
                label="Phone Number"
                value={safe(profile?.phone)}
                onCopy={() => copyText(profile?.phone, "Phone Number")}
              />

              <InfoTile
                icon={BadgeCheck}
                label="Approval Status"
                value={profile?.isApproved ? "Approved" : "Pending Approval"}
              />

              {(profile?.gstn || profile?.transportId) && (
                <>
                  <InfoTile
                    icon={ClipboardList}
                    label="GSTIN"
                    value={safe(profile?.gstn)}
                    mono
                    onCopy={profile?.gstn ? () => copyText(profile?.gstn, "GSTIN") : null}
                  />

                  <InfoTile
                    icon={ClipboardList}
                    label="Transport ID"
                    value={safe(profile?.transportId)}
                    mono
                    onCopy={
                      profile?.transportId
                        ? () => copyText(profile?.transportId, "Transport ID")
                        : null
                    }
                  />
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Subscription Details
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  active={isSubActive}
                  text={
                    isSubActive
                      ? `Active • ${safe(subscription?.plan || "Plan")}`
                      : safe(subscription?.status || "No Subscription")
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoTile icon={CreditCard} label="Plan" value={safe(subscription?.plan)} />
                <InfoTile icon={Info} label="Status" value={safe(subscription?.status)} />
                <InfoTile icon={Calendar} label="Start Date" value={fmtDateTime(subscription?.startsAt)} />
                <InfoTile icon={Calendar} label="End Date" value={fmtDateTime(subscription?.endsAt)} />
                <InfoTile
                  icon={ClipboardList}
                  label="Last Payment ID"
                  value={safe(subscription?.lastPaymentId)}
                  mono
                  onCopy={
                    subscription?.lastPaymentId
                      ? () => copyText(subscription?.lastPaymentId, "Last Payment ID")
                      : null
                  }
                />
                <InfoTile icon={Calendar} label="Subscription Updated At" value={fmtDateTime(subscription?.updatedAt)} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-amber-50 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Account Timeline
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Created At</div>
                <div className="mt-1 font-semibold text-slate-900">{fmtDateTime(profile?.createdAt)}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Updated At</div>
                <div className="mt-1 font-semibold text-slate-900">{fmtDateTime(profile?.updatedAt)}</div>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  isSubActive
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isSubActive ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  )}

                  <div>
                    <div className="font-semibold text-slate-900">
                      {isSubActive ? "Subscription is currently active" : "Subscription needs attention"}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Status: <b>{safe(subscription?.status)}</b>
                    </div>
                  </div>
                </div>
              </div>

              {isTransportUser ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm text-slate-500 mb-3">Fleet Summary</div>
                  {fleetLoading ? (
                    <div className="text-sm text-slate-500">Loading fleet...</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
                        <div className="text-xs text-emerald-700">Approved</div>
                        <div className="text-lg font-bold text-emerald-800">{fleetSummary.approved || 0}</div>
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                        <div className="text-xs text-amber-700">Pending</div>
                        <div className="text-lg font-bold text-amber-800">{fleetSummary.pending || 0}</div>
                      </div>
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
                        <div className="text-xs text-red-700">Rejected</div>
                        <div className="text-lg font-bold text-red-800">{fleetSummary.rejected || 0}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isTransportUser ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-emerald-50 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                Transporter Fleet Management
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add catalog vehicles directly. Missing vehicle can be sent for admin approval.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <PackagePlus className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Add From Catalog</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedCatalogVehicleId("");
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select category</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                    <select
                      value={selectedCatalogVehicleId}
                      onChange={(e) => setSelectedCatalogVehicleId(e.target.value)}
                      disabled={!selectedCategory || catalogLoading}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">
                        {selectedCategory ? "Select vehicle" : "Select category first"}
                      </option>
                      {selectedVehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.subCategory}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Owned</label>
                    <input
                      type="number"
                      min="1"
                      value={catalogQty}
                      onChange={(e) => setCatalogQty(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addCatalogVehicle}
                    disabled={addingCatalog || !selectedCatalogVehicleId}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                  >
                    {addingCatalog ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Vehicle
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">Request New Vehicle</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
                    <input
                      type="text"
                      value={customVehicle.group}
                      onChange={(e) =>
                        setCustomVehicle((p) => ({ ...p, group: e.target.value }))
                      }
                      placeholder="Example: Trailer / Special"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={customVehicle.category}
                      onChange={(e) =>
                        setCustomVehicle((p) => ({ ...p, category: e.target.value }))
                      }
                      placeholder="Example: Special Heavy Vehicles"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Name</label>
                    <input
                      type="text"
                      value={customVehicle.subCategory}
                      onChange={(e) =>
                        setCustomVehicle((p) => ({ ...p, subCategory: e.target.value }))
                      }
                      placeholder="Example: Hydra 25 Ton"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Owned</label>
                    <input
                      type="number"
                      min="1"
                      value={customVehicle.quantityOwned}
                      onChange={(e) =>
                        setCustomVehicle((p) => ({ ...p, quantityOwned: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={submitCustomRequest}
                    disabled={requestingCustom}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-60"
                  >
                    {requestingCustom ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-sky-50 border-b border-slate-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    My Fleet
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Approved vehicles are used for transporter eligibility in tender selection.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fleetSearch}
                      onChange={(e) => setFleetSearch(e.target.value)}
                      placeholder="Search fleet..."
                      className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={fleetFilter}
                    onChange={(e) => setFleetFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {fleetLoading ? (
                <div className="text-center py-10">
                  <RefreshCcw className="h-8 w-8 mx-auto text-emerald-600 animate-spin" />
                  <div className="mt-3 text-slate-700 font-medium">Loading fleet...</div>
                </div>
              ) : filteredFleet.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  <Truck className="h-10 w-10 text-slate-400 mx-auto" />
                  <div className="mt-3 text-slate-700 font-medium">No fleet vehicles found</div>
                  <div className="text-sm text-slate-500 mt-1">
                    Add from catalog or submit a custom vehicle request.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredFleet.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <FleetStatusBadge status={item.status} />
                            <span className="text-xs px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                              {item.source === "catalog" ? "Catalog" : "Custom"}
                            </span>
                          </div>

                          <h3 className="mt-3 text-base font-bold text-slate-900">{safe(item.subCategory)}</h3>
                          <div className="text-sm text-slate-600 mt-1">{safe(item.category)}</div>
                          {item.group ? <div className="text-xs text-slate-500 mt-1">Group: {item.group}</div> : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteFleetVehicle(item._id)}
                          disabled={deletingId === item._id}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-60"
                          title="Remove vehicle"
                        >
                          {deletingId === item._id ? (
                            <RefreshCcw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs text-slate-500">Quantity Owned</div>
                          <div className="text-lg font-bold text-slate-900 mt-1">
                            {Number(item.quantityOwned || 0)}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs text-slate-500">Updated</div>
                          <div className="text-sm font-semibold text-slate-900 mt-1">
                            {fmtDateTime(item.updatedAt)}
                          </div>
                        </div>
                      </div>

                      {item.adminRemark ? (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                          <div className="font-semibold">Admin Remark</div>
                          <div className="mt-1">{item.adminRemark}</div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}