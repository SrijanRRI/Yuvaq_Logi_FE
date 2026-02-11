import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "../../API";
import {
  CheckCircle,
  XCircle,
  Calendar,
  IndianRupee,
  Loader2,
  AlertTriangle,
  MapPin,
  User2,
  Truck,
  Clock3,
  Package,
} from "lucide-react";

const authCfg = () => {
  const token = localStorage.getItem("session_token");
  return {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

const fmtAddr = (x) =>
  [x?.dispatchLocation, x?.address, x?.pincode].filter(Boolean).join(", ") || "—";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "RR";

export default function PendingConfirmationsView({ items = [], loading = false, onRefresh }) {
  // per-tender action loader: { [tenderId]: 'accept' | 'reject' | null }
  const [actionLoadingByTender, setActionLoadingByTender] = useState({});

  // reject modal state
  const [rejectModal, setRejectModal] = useState({ open: false, tenderId: "", title: "" });
  const [rejectReason, setRejectReason] = useState("");

  const isLoadingFor = (tenderId, action) => actionLoadingByTender?.[tenderId] === action;
  const setLoadingFor = (tenderId, actionOrNull) =>
    setActionLoadingByTender((p) => ({ ...p, [tenderId]: actionOrNull }));

  // NEW RESPONSE SHAPE: item already has { dispatchLocation, closeDate, materials, selection, quotation, requestedBy }
  const normalize = (x) => {
    // fallback support (if old shape ever comes)
    if (x?.dispatchLocation || x?.quotation || x?.requestedBy) return x;

    const tender = x?.tender || x?.tenderId || x;
    const quotation = x?.quotation || x?.selectedQuotation || x?.quote || x?.q;

    return {
      ...tender,
      quotation,
      requestedBy: x?.requestedBy || tender?.createdBy || null,
      selection: tender?.selection || x?.selection,
    };
  };

  const respond = async (tenderId, action, reason = "") => {
    if (!tenderId) return toast.error("Tender ID missing.");
    if (actionLoadingByTender[tenderId]) return;

    try {
      setLoadingFor(tenderId, action);

      await axios.post(
        `${API.RESPOND_SELECTION}/${tenderId}/selection/respond`,
        { action, reason },
        authCfg()
      );

      toast.success(action === "accept" ? "You accepted the selection." : "You rejected the selection.");
      await onRefresh?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not submit response.");
    } finally {
      setLoadingFor(tenderId, null);
    }
  };

  const openRejectModal = (tenderId, title) => {
    setRejectReason("");
    setRejectModal({ open: true, tenderId, title: title || "Tender" });
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, tenderId: "", title: "" });
    setRejectReason("");
  };

  const submitReject = async () => {
    const reason = (rejectReason || "").trim();
    if (!reason) return toast.error("Reject reason required.");

    const tenderId = rejectModal.tenderId;

    // keep modal snappy
    closeRejectModal();
    await respond(tenderId, "reject", reason);
  };

  const quickReasons = [
    "Vehicle not available",
    "Schedule conflict",
    "Route not feasible",
    "Price mismatch",
    "Capacity issue",
    "Other",
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600">Loading pending confirmations…</p>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800">No pending confirmations</h3>
        <p className="text-slate-500 text-sm mt-1">If RR requests confirmation, it will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {items.map((raw, idx) => {
          const x = normalize(raw);

          const tenderId = x?._id || "";
          const q = x?.quotation || null;
          const sel = x?.selection || {};
          const rr = x?.requestedBy || null;

          const title =
            x?.projectName ||
            x?.projectCode ||
            (x?.dispatchLocation ? `Dispatch: ${x.dispatchLocation}` : `Tender #${idx + 1}`);

          const deliveryText =
            x?.deliveryWindow?.from && x?.deliveryWindow?.to
              ? `${fmtDate(x.deliveryWindow.from)} → ${fmtDate(x.deliveryWindow.to)}`
              : "—";

          const mat = Array.isArray(x?.materials) ? x.materials : [];
          const shown = mat.slice(0, 3);
          const more = mat.length - shown.length;

          return (
            <div
              key={tenderId || idx}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-4 sm:p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-teal-600" />
                    <h4 className="font-semibold text-slate-900 truncate">{title}</h4>
                  </div>

                  {/* Requested by */}
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                      {initials(rr?.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <User2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800 truncate">
                          {rr?.name || rr?.email || "RR User"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {rr?.email ? rr.email : ""}
                        {rr?.phone ? ` • ${rr.phone}` : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Pending
                </span>
              </div>

              {/* Key details (minimal grid) */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Location
                  </div>
                  <div className="text-sm text-slate-800 mt-1 break-words">{fmtAddr(x)}</div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Close Date
                  </div>
                  <div className="text-sm text-slate-800 mt-1">{fmtDate(x?.closeDate)}</div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" />
                    Delivery Window
                  </div>
                  <div className="text-sm text-slate-800 mt-1">{deliveryText}</div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    Quotation
                  </div>
                  <div className="mt-1 text-sm text-slate-800 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="font-semibold">
                      {q?.price != null ? `₹${Number(q.price).toLocaleString("en-IN")}` : "—"}
                    </span>
                    {q?.rank ? <span className="text-slate-600">Rank: {q.rank}</span> : null}
                    {q?.vehicleNumber ? (
                      <span className="text-slate-600">Vehicle: {q.vehicleNumber}</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Requested at + materials */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                <div className="w-full sm:w-auto">
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                    <Package className="w-3.5 h-3.5" />
                    Materials
                  </div>

                  {mat.length === 0 ? (
                    <div className="text-sm text-slate-700">—</div>
                  ) : (
                    <div className="space-y-2">
                      {mat.slice(0, 3).map((m, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                          title={`${m.material || ""} ${m.subMaterial || ""}`.trim()}
                        >
                          {/* line 1: material name */}
                          <div className="text-sm font-medium text-slate-800">
                            {m.material || "Material"}
                            {m.subMaterial ? (
                              <span className="text-slate-500 font-normal"> • {m.subMaterial}</span>
                            ) : null}
                          </div>

                          {/* line 2: metrics */}
                          <div className="mt-1 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Weight: {m.weight != null ? `${m.weight} MT` : "—"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                              Qty: {m.quantity != null ? `${m.quantity} pcs` : "—"}
                            </span>
                          </div>
                        </div>
                      ))}

                      {mat.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{mat.length - 3} more material(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  Requested at:{" "}
                  <span className="text-slate-700 font-medium">{fmtDateTime(sel?.requestedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 justify-end">
                {/* ACCEPT */}
                <button
                  onClick={() => respond(tenderId, "accept")}
                  disabled={!!actionLoadingByTender[tenderId]}
                  className={`px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2
                    ${isLoadingFor(tenderId, "accept")
                      ? "bg-emerald-500 text-white opacity-80 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                >
                  {isLoadingFor(tenderId, "accept") ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isLoadingFor(tenderId, "accept") ? "Accepting..." : "Accept"}
                </button>

                {/* REJECT */}
                <button
                  onClick={() => openRejectModal(tenderId, title)}
                  disabled={!!actionLoadingByTender[tenderId]}
                  className={`px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2
                    ${isLoadingFor(tenderId, "reject")
                      ? "border border-red-300 text-red-600 bg-red-50 opacity-80 cursor-not-allowed"
                      : "border border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                >
                  {isLoadingFor(tenderId, "reject") ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {isLoadingFor(tenderId, "reject") ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= Reject Reason Modal ================= */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeRejectModal} />

          {/* modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-red-600 to-rose-600 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-white/90" />
                      <h3 className="text-lg font-semibold truncate">Reject Confirmation</h3>
                    </div>
                    <p className="text-white/90 text-sm mt-1 truncate">{rejectModal.title}</p>
                  </div>

                  <button
                    onClick={closeRejectModal}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                    aria-label="Close"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                {/* quick reasons */}
                <div className="flex flex-wrap gap-2">
                  {quickReasons.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRejectReason(r)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition
                        ${rejectReason === r ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Reason for rejection <span className="text-red-600">*</span>
                </label>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Write a clear reason…"
                  className="mt-2 w-full rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent p-3 text-sm"
                />

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={closeRejectModal}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={submitReject}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm inline-flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Submit Rejection
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Note: After rejection, YuvaQ will move to the next eligible quotation rank.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}