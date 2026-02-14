import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Timer, MapPin, IndianRupee, RefreshCcw } from "lucide-react";
import PostBidQuotationModal from "../../modals/PostBidQuotationModal";
import CountdownTimer from "../../components/CountdownTimer";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PostBidNegotiationsView({ items = [], loading, onRefresh }) {
  const [selected, setSelected] = useState(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Loading post-bid tenders...</p>
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center shadow-md">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Timer className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Post-Bid</h3>
        <p className="text-slate-500 max-w-md mb-6">
          If you participated in a tender and User starts post-bid, it will appear here for 10 minutes.
        </p>
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-colors shadow-md flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {sorted.map((t) => {
        const endsAt = t.endsAt;
        const expired = Date.now() >= new Date(endsAt).getTime();
        const rangeStr = `${fmt(t.rangeMin)} - ${fmt(t.rangeMax)}`;

        return (
          <div key={t.tenderId} className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-bold">
                    {t.projectName || "Tender"}{" "}
                    {t.projectCode ? <span className="text-white/80">({t.projectCode})</span> : null}
                  </div>
                  <div className="text-sm text-white/80 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    {t.dispatchLocation || "Location"} {t.pincode ? `• ${t.pincode}` : ""}
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-sm">
                  Post-Bid Range: <b>{rangeStr}</b>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                expired ? "bg-red-50 border-red-100" : "bg-teal-50 border-teal-100"
              }`}>
                <div className={`p-3 rounded-full ${expired ? "bg-red-100" : "bg-teal-100"}`}>
                  <Timer className={`w-6 h-6 ${expired ? "text-red-500" : "text-teal-600"}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${expired ? "text-red-700" : "text-teal-700"}`}>
                    {expired ? "Post-Bid Ended" : "Post-Bid Ends In"}
                  </p>
                  <p className={`text-xl font-bold ${expired ? "text-red-800" : "text-teal-900"}`}>
                    <CountdownTimer endTime={endsAt} labelWhenDone="Expired" />
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                {expired ? (
                  <div className="px-6 py-3 rounded-lg bg-slate-100 text-slate-500">
                    Window Closed
                  </div>
                ) : (
                  <button
                    onClick={() => setSelected(t)}
                    className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md flex items-center gap-2 font-medium"
                  >
                    <IndianRupee className="w-5 h-5" />
                    Submit Post-Bid Quote
                  </button>
                )}
              </div>
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