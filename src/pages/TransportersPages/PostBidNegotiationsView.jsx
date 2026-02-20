import { useMemo, useState } from "react";
import {
  Timer,
  MapPin,
  IndianRupee,
  RefreshCcw,
  BadgeIndianRupee,
  Truck,
  Package,
  Scale,
} from "lucide-react";
import PostBidQuotationModal from "../../modals/PostBidQuotationModal";
import CountdownTimer from "../../components/CountdownTimer";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function cx(...a) {
  return a.filter(Boolean).join(" ");
}

// ✅ helpers for pickup/drop formatting (UI-only)
const placeLine = (loc) => {
  if (!loc) return "";
  const cityOrDistrict = (loc.city || loc.district || "").trim();
  const state = (loc.state || "").trim();
  const pin = loc.pincode ? `PIN ${String(loc.pincode).trim()}` : "";
  const base = [cityOrDistrict, state].filter(Boolean).join(", ");
  return [base, pin].filter(Boolean).join(" • ");
};

const addressLine = (loc) => {
  if (!loc) return "";
  return String(loc.address || loc.location || "").trim();
};

const vehicleLabel = (v) => {
  const name = String(v?.subCategory || "").trim() || "Vehicle";
  const qty = Number(v?.quantity ?? 0);
  return qty > 0 ? `${name} ×${qty}` : name;
};

export default function PostBidNegotiationsView({ items = [], loading, onRefresh }) {
  const [selected, setSelected] = useState(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading post-bid tenders...</p>
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Timer className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Post-Bid</h3>
        <p className="text-slate-500 max-w-md mb-6">
          If you participated in a tender and User starts post-bid, it will appear here for 10 minutes.
        </p>
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-colors shadow-md flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">Active Post-Bid</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            {sorted.length} item(s)
          </span>
        </div>

        <button
          onClick={onRefresh}
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {sorted.map((t, idx) => {
        const endsAt = t.endsAt;
        const expired = Date.now() >= new Date(endsAt).getTime();
        const rangeMin = t.rangeMin;
        const rangeMax = t.rangeMax;

        // ✅ Pickup/Drop (new API)
        const pickupAddr = addressLine(t.pickup);
        const pickupPlace = placeLine(t.pickup);
        const dropAddr = addressLine(t.drop);
        const dropPlace = placeLine(t.drop);

        // ✅ Vehicles (new API)
        const vehicles = Array.isArray(t.vehicleRequirements) ? t.vehicleRequirements : [];
        const vehicleChips = vehicles.map((v, i) => ({
          key: String(v?.vehicleId || i),
          text: vehicleLabel(v),
          cat: String(v?.category || "").trim(),
        }));

        return (
          <div
            key={t.tenderId}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="relative">
              <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-emerald-700 text-white p-5 sm:p-6">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-44 h-44 bg-white rounded-full blur-2xl" />
                  <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-black rounded-full blur-3xl opacity-20" />
                </div>

                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="min-w-0">
                      {/* ✅ Title updated (no projectName/projectCode) */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold truncate">
                          Post-Bidding for Previous Tender
                        </h3>
                        <span className="text-xs sm:text-sm px-2 py-0.5 rounded-full bg-white/15 border border-white/25">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* ✅ Pickup + Drop (responsive) */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Pickup */}
                        <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5">
                              <MapPin className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-[11px] uppercase tracking-wide text-white/80 font-semibold">
                                Pickup
                              </div>
                              <div className="text-sm font-semibold text-white/95 break-words">
                                {pickupAddr || "Pickup not available"}
                              </div>
                              <div className="text-xs text-white/85 break-words mt-0.5">
                                {pickupPlace || "—"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Drop */}
                        <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5">
                              <MapPin className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-[11px] uppercase tracking-wide text-white/80 font-semibold">
                                Drop
                              </div>
                              <div className="text-sm font-semibold text-white/95 break-words">
                                {dropAddr || "Drop not available"}
                              </div>
                              <div className="text-xs text-white/85 break-words mt-0.5">
                                {dropPlace || "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Range pill - keep as-is */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:items-end lg:justify-end">
                      <div className="px-3 py-2 rounded-xl bg-white/15 border border-white/25">
                        <div className="flex items-center gap-2 text-xs text-white/85">
                          <BadgeIndianRupee className="w-4 h-4" />
                          <span>Allowed Range</span>
                        </div>
                        <div className="mt-0.5 text-base sm:text-lg font-extrabold tracking-tight">
                          {fmt(rangeMin)} <span className="text-white/80">—</span> {fmt(rangeMax)}
                        </div>
                      </div>

                      <div
                        className={cx(
                          "px-3 py-2 rounded-xl border text-xs font-semibold",
                          expired
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}
                      >
                        {expired ? "EXPIRED" : "LIVE"}
                      </div>
                    </div>
                  </div>

                  {/* ✅ Vehicles + Weight/Qty (responsive quick row) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Truck className="w-4 h-4" />
                        <span className="font-semibold">Vehicle Requirements</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {vehicleChips.length ? (
                          vehicleChips.map((c) => (
                            <span
                              key={c.key}
                              className="inline-flex items-center rounded-full bg-white/15 border border-white/20 px-2.5 py-1 text-xs font-semibold text-white/95"
                              title={c.cat || ""}
                            >
                              {c.text}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-white/80">No vehicle requirements</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Package className="w-4 h-4" />
                        <span className="font-semibold">Load Summary</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-2.5 py-1 text-xs font-semibold text-white/95">
                          <Scale className="w-4 h-4" /> {t.totalWeight ?? "—"} MT
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-2.5 py-1 text-xs font-semibold text-white/95">
                          <Package className="w-4 h-4" /> {t.totalQuantity ?? "—"} pcs
                        </span>
                      </div>
                    </div>
                  </div>

                  {!expired && (
                    <div className="text-xs text-white/85">
                      Submit your improved quote before the timer ends. Your quote must be inside the allowed range.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "p-3 rounded-xl border",
                      expired ? "bg-red-50 border-red-100" : "bg-teal-50 border-teal-100",
                    ].join(" ")}
                  >
                    <Timer className={["w-6 h-6", expired ? "text-red-500" : "text-teal-600"].join(" ")} />
                  </div>

                  <div>
                    <div className={["text-sm font-medium", expired ? "text-red-700" : "text-teal-700"].join(" ")}>
                      {expired ? "Post-Bid Ended" : "Post-Bid Ends In"}
                    </div>
                    <div className={["text-xl font-extrabold", expired ? "text-red-800" : "text-slate-900"].join(" ")}>
                      <CountdownTimer endTime={endsAt} labelWhenDone="Expired" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center sm:justify-end">
                  {expired ? (
                    <div className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-500 text-center border border-slate-200">
                      Window Closed
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelected(t)}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 font-semibold"
                    >
                      <IndianRupee className="w-5 h-5" />
                      Submit Post-Bid Quote
                    </button>
                  )}
                </div>
              </div>

              {!expired && (
                <div className="mt-3 text-xs text-slate-500">
                  Submit your improved quote before the timer ends (must be within the allowed range).
                </div>
              )}
            </div>
          </div>
        );
      })}

      {selected && (
        <PostBidQuotationModal
          tender={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => {
            setSelected(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}