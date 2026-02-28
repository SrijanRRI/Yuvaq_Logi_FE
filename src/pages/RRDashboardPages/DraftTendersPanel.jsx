import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Timer,
  RefreshCcw,
  Search,
  X,
  ChevronDown,
  Clock3,
  Pencil,
  XCircle,
  Clipboard,
  Truck,
  Package,
  Calendar,
  Info,
  CheckCircle2,
} from "lucide-react";
import API from "../../API";

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

const fmtMs = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
};

const toIST = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

const toISTDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

const fmtINR = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return `₹${x.toLocaleString("en-IN")}`;
};

const safe = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

const Badge = ({ tone = "slate", children }) => {
  const map = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[tone]}`}>
      {children}
    </span>
  );
};

const KV = ({ label, value, mono = false }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <div className="text-[11px] text-slate-500">{label}</div>
    <div className={`text-sm font-semibold text-slate-900 break-words ${mono ? "font-mono text-xs" : ""}`}>
      {value}
    </div>
  </div>
);

const DraftAccordionItem = ({
  draft,
  isOpen,
  onToggle,
  nowMs,
  onEdit,
  onCancel,
  busyCancel,
  onCopyId,
}) => {
  const createdAt = draft?.createdAt ? new Date(draft.createdAt).getTime() : null;
  const submitAt = draft?.draftSubmitAt ? new Date(draft.draftSubmitAt).getTime() : null;
  const effectiveSubmitAt = submitAt ?? (createdAt ? createdAt + 3 * 60 * 1000 : null);
  const msLeft = effectiveSubmitAt ? Math.max(0, effectiveSubmitAt - nowMs) : 0;

  const totalMs = 3 * 60 * 1000;
  const progress = (() => {
    if (!effectiveSubmitAt || !createdAt) return 0;
    const elapsed = Math.min(totalMs, Math.max(0, nowMs - createdAt));
    return Math.round((elapsed / totalMs) * 100);
  })();

  const vehicles = Array.isArray(draft?.vehicleRequirements) ? draft.vehicleRequirements.length : 0;
  const transporters = Array.isArray(draft?.transporters) ? draft.transporters.length : 0;

  const status = String(draft?.status || "draft").toLowerCase();
  const statusLabel = status === "draft" ? (msLeft > 0 ? "DRAFT ACTIVE" : "PUBLISHING…") : status.toUpperCase();
  const statusTone = msLeft > 0 ? "indigo" : "amber";

  const canEdit = msLeft > 0;
  const canCancel = msLeft > 0 && !busyCancel;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header row (like TransporterResponseItem) */}
      <div
        className={`px-4 py-3 border-b ${isOpen ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-200"
          }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <Clock3 className="h-5 w-5 text-indigo-700" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-bold text-slate-900 truncate max-w-[38ch]">
                  {draft?.projectName || "Untitled Draft"}
                </div>
                <Badge tone={statusTone}>{statusLabel}</Badge>
              </div>

              <div className="mt-1 text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                <span className="truncate">
                  Code: <b>{safe(draft?.projectCode)}</b> · PO: <b>{safe(draft?.purchaseOrder)}</b>
                </span>
                <span className="text-slate-400">·</span>
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> {transporters}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> {vehicles}
                </span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-slate-500">Time left</div>
              <div className={`text-lg font-black ${msLeft > 0 ? "text-indigo-700" : "text-amber-700"}`}>
                {fmtMs(msLeft)}
              </div>
              <div className="text-[11px] text-slate-500">
                Publish: <b>{toIST(effectiveSubmitAt)}</b>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
              title={isOpen ? "Collapse" : "Expand"}
            >
              <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* mobile time */}
        <div className="sm:hidden mt-2 flex items-center justify-between text-xs text-slate-600">
          <div>
            Time left:{" "}
            <span className={`font-black ${msLeft > 0 ? "text-indigo-700" : "text-amber-700"}`}>{fmtMs(msLeft)}</span>
          </div>
          <div className="truncate">
            Publish: <b>{toIST(effectiveSubmitAt)}</b>
          </div>
        </div>

        {/* progress */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
            <span>Timer</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
        </div>
      </div>

      {/* Body (single accordion details) */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* actions row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onEdit}
              disabled={!canEdit}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition
                ${canEdit ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              <Pencil className="h-4 w-4" />
              Edit Draft
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={!canCancel}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition
                ${canCancel ? "border-red-200 text-red-700 bg-white hover:bg-red-50" : "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"}`}
            >
              <XCircle className="h-4 w-4" />
              {busyCancel ? "Cancelling…" : "Cancel Draft"}
            </button>
          </div>

          {/* minimal sections (inside ONE accordion) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <KV label="Project Name" value={safe(draft?.projectName)} />
            <KV label="Project Code" value={safe(draft?.projectCode)} />
            <KV label="Purchase Order" value={safe(draft?.purchaseOrder)} />
            <KV label="Remarks" value={safe(draft?.remarks)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <KV label="Min Bid" value={fmtINR(draft?.minBidAmount)} />
            <KV label="Max Bid" value={fmtINR(draft?.maxBidAmount)} />
            <KV label="Unit" value={safe(draft?.maxBidUnit)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <KV label="Delivery From" value={toISTDate(draft?.deliveryWindow?.from)} />
            <KV label="Delivery To" value={toISTDate(draft?.deliveryWindow?.to)} />
            <KV label="Closing Date" value={toISTDate(draft?.closeDate)} />
            <KV label="Draft Submit At" value={toIST(draft?.draftSubmitAt)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <KV label="Bidding Start" value={toIST(draft?.biddingStart)} />
            <KV label="Soft End" value={toIST(draft?.biddingSoftEnd || draft?.biddingEnd)} />
            <KV label="Hard Stop" value={toIST(draft?.biddingHardEnd || draft?.biddingSoftEnd || draft?.biddingEnd)} />
          </div>

          {/* Pickup/Drop (clean blocks) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Truck className="h-4 w-4 text-emerald-600" />
                Pickup
              </div>
              <div className="mt-2 text-sm text-slate-700 space-y-1">
                <div>
                  <span className="text-slate-500">PIN:</span> <b>{safe(draft?.pickup?.pincode)}</b>
                </div>
                <div>
                  <span className="text-slate-500">State:</span> {safe(draft?.pickup?.state)} ·{" "}
                  <span className="text-slate-500">District:</span> {safe(draft?.pickup?.district)}
                </div>
                <div>
                  <span className="text-slate-500">City:</span> {safe(draft?.pickup?.city)}
                </div>
                <div className="text-slate-600 break-words">
                  <span className="text-slate-500">Address:</span> {safe(draft?.pickup?.address)}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Truck className="h-4 w-4 text-sky-600" />
                Drop
              </div>
              <div className="mt-2 text-sm text-slate-700 space-y-1">
                <div>
                  <span className="text-slate-500">PIN:</span> <b>{safe(draft?.drop?.pincode)}</b>
                </div>
                <div>
                  <span className="text-slate-500">State:</span> {safe(draft?.drop?.state)} ·{" "}
                  <span className="text-slate-500">District:</span> {safe(draft?.drop?.district)}
                </div>
                <div>
                  <span className="text-slate-500">City:</span> {safe(draft?.drop?.city)}
                </div>
                <div className="text-slate-600 break-words">
                  <span className="text-slate-500">Address:</span> {safe(draft?.drop?.address)}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicles table (minimal) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Package className="h-4 w-4 text-indigo-600" />
                Vehicle Requirements
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-3">
                <span>
                  Total Weight: <b>{safe(draft?.totalWeight)}</b>
                </span>
                <span>
                  Total Qty: <b>{safe(draft?.totalQuantity)}</b>
                </span>
              </div>
            </div>

            {Array.isArray(draft?.vehicleRequirements) && draft.vehicleRequirements.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border border-slate-200">
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Category</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Sub Category</th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-700">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.vehicleRequirements.map((v, i) => (
                      <tr key={`${v.vehicleId}-${i}`} className="border-b border-slate-200">
                        <td className="px-3 py-2">{safe(v.category)}</td>
                        <td className="px-3 py-2">{safe(v.subCategory)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{safe(v.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                No vehicles added.
              </div>
            )}
          </div>

          {/* Transporters chips */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Truck className="h-4 w-4 text-emerald-600" />
              Transporters ({Array.isArray(draft?.transporters) ? draft.transporters.length : 0})
            </div>

            {Array.isArray(draft?.transporters) && draft.transporters.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.transporters.map((id, idx) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      // optional: copy ID on click
                      navigator.clipboard?.writeText(String(id));
                      toast.success("Transporter ID copied");
                    }}
                    className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 hover:bg-slate-100 transition"
                    title={`ID: ${id} (click to copy)`}
                  >
                    Transporter {idx + 1}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                No transporters selected.
              </div>
            )}
          </div>

          {/* small meta footer */}
          <div className="text-xs text-slate-500 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5" />
            <div className="break-words">
              Draft will auto-publish to <b>Open</b> after timer ends (server cron). If you cancel before time ends,
              it will not publish.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DraftTendersPanel({ onEditDraft, onGoCreate, onGoHistory }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyCancelId, setBusyCancelId] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const normalizeDrafts = (payload) => {
    const d0 = payload?.data; // null | object | array
    if (!d0) return [];
    const arr = Array.isArray(d0) ? d0 : [d0];
    return arr.filter((x) => x && x._id);
  };

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API.DRAFT_TENDER_ACTIVE, authCfg());
      const payload = res?.data;

      const list = normalizeDrafts(payload);

      // sort: soonest publish first
      const sorted = [...list].sort((a, b) => {
        const aT = a?.draftSubmitAt ? new Date(a.draftSubmitAt).getTime() : 0;
        const bT = b?.draftSubmitAt ? new Date(b.draftSubmitAt).getTime() : 0;
        return aT - bT;
      });

      setDrafts(sorted);

      // keep open stable
      setOpenId((prev) => {
        if (prev && sorted.some((d) => d._id === prev)) return prev;
        return sorted[0]?._id || null;
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load drafts.");
      setDrafts([]);
      setOpenId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drafts;
    return drafts.filter((d) => {
      const blob = [d.projectName, d.projectCode, d.purchaseOrder, d._id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [drafts, search]);

  const cancelDraft = async (draft) => {
    const id = draft?._id;
    if (!id) return;
    try {
      setBusyCancelId(id);
      await axios.post(`${API.DRAFT_TENDER_CANCEL}/${id}/cancel`, {}, authCfg());
      toast.success("Draft cancelled.");
      await fetchDrafts();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to cancel draft.");
    } finally {
      setBusyCancelId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header (minimal, clean) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Timer className="h-6 w-6" />
              <div>
                <div className="text-xl font-bold">Draft Tenders</div>
                <div className="text-sm text-white/90">Draft stays for <b>3 minutes</b> (editable).</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onGoCreate}
                className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:bg-white/90 transition"
              >
                Create Tender
              </button>
              <button
                onClick={onGoHistory}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition"
              >
                View History
              </button>
              <button
                onClick={fetchDrafts}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 transition disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* search */}
          <div className="mt-4 relative">
            <Search className="h-4 w-4 text-white/80 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search draft by project / code / PO / id…"
              className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10"
                title="Clear"
              >
                <X className="h-4 w-4 text-white/80" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5" />
          <div>
            Save creates a <b>draft</b>. After 3 minutes it auto-publishes to <b>Open</b> by backend cron.
            Cancel before timer ends to stop publish.
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-600">
          Loading drafts…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-3">
            <CheckCircle2 className="h-7 w-7 text-slate-400" />
          </div>
          <div className="text-slate-900 font-bold">No active drafts</div>
          <div className="text-sm text-slate-600 mt-1">
            Create a tender draft to get the 3-minute edit window.
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={onGoCreate}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-semibold"
            >
              Create Tender
            </button>
            <button
              onClick={onGoHistory}
              className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition font-semibold"
            >
              View History
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DraftAccordionItem
              key={d._id}
              draft={d}
              nowMs={nowMs}
              isOpen={openId === d._id}
              onToggle={() => setOpenId((p) => (p === d._id ? null : d._id))}
              onEdit={() => onEditDraft(d)}
              onCancel={() => cancelDraft(d)}
              busyCancel={busyCancelId === d._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}