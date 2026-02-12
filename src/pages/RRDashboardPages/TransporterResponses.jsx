import { useMemo } from "react";
import TransporterResponseItem from "./TransporterResponseItem"
import { Truck, AlertCircle } from "lucide-react"

const TransporterResponses = ({
  responses,
  tender,
  selectedQuotationId,
  confirmedIdxMap,
  reopenedTenders,
  editingId,
  priceInput,
  setEditingId,
  setPriceInput,
  onConfirmFinal,
  onReopen,
  getTransporterName,
  setPreviewFile,
  responseError,
  contact,
  contactLoading,
  onRevealContact,
  onRequestConfirmation,
  onProceedToPay,
  requestingConfirmByQ = {},
}) => {

  // ---- NEW: Decide which quotation should show the "Request Confirmation" button ----
  const rankIndex = (r) => {
    const m = String(r?.rank || "").match(/^L(\d+)$/i);
    return m ? Number(m[1]) : 999;
  };

  const orderedResponses = [...(responses || [])].sort((a, b) => {
    const ra = rankIndex(a);
    const rb = rankIndex(b);
    if (ra !== rb) return ra - rb;
    return (a.price ?? Infinity) - (b.price ?? Infinity); // tie-breaker
  });

  // Build rejection map (supports backend history if you add it)
  // const rejectReasonByQuotationId = (() => {
  //   const map = {};

  //   // ✅ preferred: tender.selectionHistory = [{ quotation, status, rejectReason, at }]
  //   const hist = tender?.selectionHistory || [];
  //   for (const h of hist) {
  //     if (h?.status === "rejected" && h?.quotation) {
  //       map[String(h.quotation)] = h.rejectReason || "Rejected";
  //     }
  //   }

  //   // fallback: current selection (only latest)
  //   const sel = tender?.selection || {};
  //   if (sel.status === "rejected" && sel.quotation) {
  //     map[String(sel.quotation)] = sel.rejectReason || "Rejected";
  //   }

  //   return map;
  // })();

  const selectionMetaByQuotationId = useMemo(() => {
    const map = {};
    const hist = tender?.selectionHistory || [];

    // Keep the latest meaningful event per quotation
    for (const e of hist) {
      const q = e?.quotation ? String(e.quotation) : null;
      if (!q) continue;

      if (["reject", "reopen", "remove"].includes(e.action)) {
        map[q] = {
          action: e.action,           // reject | reopen | remove
          reason: e.reason || "",
          byRole: e.byRole || "system", // rr | transporter | system
        };
      }
    }

    // fallback (latest selection only)
    const sel = tender?.selection;
    if (sel?.status === "rejected" && sel?.quotation) {
      map[String(sel.quotation)] = {
        action: "reject",
        reason: sel.rejectReason || "",
        byRole: "transporter",
      };
    }

    return map;
  }, [tender]);

  const rejectedSet = new Set(Object.keys(selectionMetaByQuotationId));

  for (const r of orderedResponses) {
    if (r?.eligible === false) rejectedSet.add(String(r._id));
  }

  const actionableQuotationId = (() => {
    const sel = tender?.selection || {};
    const status = sel.status;
    const selQ = sel.quotation ? String(sel.quotation) : null;

    // pending/confirmed: actionable is that quotation only
    if ((status === "pending" || status === "confirmed") && selQ) return selQ;

    // rejected: choose next after rejected (skip already rejected ones)
    if (status === "rejected" && selQ) {
      const start = orderedResponses.findIndex((r) => String(r._id) === selQ);
      for (let i = start + 1; i < orderedResponses.length; i++) {
        const id = String(orderedResponses[i]._id);
        if (!rejectedSet.has(id)) return id;
      }
      return null; // no next available
    }

    // no selection yet: pick first non-rejected
    for (let i = 0; i < orderedResponses.length; i++) {
      const id = String(orderedResponses[i]._id);
      if (!rejectedSet.has(id)) return id;
    }
    return null;
  })();

  return (
    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
      <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-slate-800 flex items-center gap-2">
        <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
        <span className="truncate">Transporter Responses</span>
      </h4>

      {responseError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg sm:rounded-xl p-4 sm:p-5 text-sm mb-4 sm:mb-5 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium mb-1">Error Loading Responses</p>
            <p className="break-words">{responseError}</p>
          </div>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
          <div className="bg-white rounded-full p-3 sm:p-4 inline-flex mb-3 shadow-sm">
            <Truck className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300" />
          </div>
          <p className="text-slate-700 font-medium mb-2 text-sm sm:text-base">No responses received yet</p>
          <p className="text-slate-500 text-xs sm:text-sm">
            Transporters haven't submitted any quotations for this tender
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {orderedResponses.map((res, idx) => (
            <TransporterResponseItem
              key={res._id || idx}
              response={res}
              idx={idx}
              tender={tender}
              selectedQuotationId={selectedQuotationId}
              confirmedIdxMap={confirmedIdxMap}
              reopenedTenders={reopenedTenders}
              editingId={editingId}
              priceInput={priceInput}
              setEditingId={setEditingId}
              setPriceInput={setPriceInput}
              onConfirmFinal={onConfirmFinal}
              onReopen={onReopen}
              getTransporterName={getTransporterName}
              setPreviewFile={setPreviewFile}
              contact={contact}
              contactLoading={contactLoading}
              onRevealContact={onRevealContact}
              onRequestConfirmation={onRequestConfirmation}
              onProceedToPay={onProceedToPay}

              actionableQuotationId={actionableQuotationId}
              selectionMetaByQuotationId={selectionMetaByQuotationId}
              requestingConfirm={!!requestingConfirmByQ?.[res._id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TransporterResponses
