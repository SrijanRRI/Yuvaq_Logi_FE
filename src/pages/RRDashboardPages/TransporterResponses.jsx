import { useMemo, useState, useEffect } from "react";
import TransporterResponseItem from "./TransporterResponseItem";
import { Truck, AlertCircle } from "lucide-react";

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
  const asId = (x) => (x && typeof x === "object" ? x._id : x);

  const biddingEndMs = tender?.biddingEnd ? new Date(tender.biddingEnd).getTime() : null;
  const postBidEndMs = tender?.postBid?.endsAt ? new Date(tender.postBid.endsAt).getTime() : null;

  const sortByPriceThenTime = (a, b) => {
    const pa = a?.price ?? Infinity;
    const pb = b?.price ?? Infinity;
    if (pa !== pb) return pa - pb;
    const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  };

  const isPostBidQuote = (q) => {
    if (q?.isPostBid != null) return !!q.isPostBid;

    const src = String(q?.source || q?.phase || q?.bidType || "").toLowerCase();
    if (["post_bid", "postbid", "post-bid", "improved"].includes(src)) return true;

    const t = q?.createdAt ? new Date(q.createdAt).getTime() : null;
    if (!t || biddingEndMs == null) return false;

    if (postBidEndMs != null) return t >= biddingEndMs && t <= postBidEndMs;
    return t >= biddingEndMs;
  };

  const {
    normalDisplay,
    postBidDisplay,
    effectiveOrdered,
    aliasByTransporter,
    effectiveRankByTransporter,
    effectiveIdByTransporter,
  } = useMemo(() => {
    const all = Array.isArray(responses) ? responses : [];

    const normalAll = all.filter((q) => !isPostBidQuote(q));
    const postAll = all.filter((q) => isPostBidQuote(q));

    const normalSorted = normalAll.slice().sort(sortByPriceThenTime);
    const postSorted = postAll.slice().sort(sortByPriceThenTime);

    const normalDisplayLocal = normalSorted.map((q, i) => ({
      ...q,
      __phase: "normal",
      __displayRank: q.rank || `L${i + 1}`,
    }));

    const postBidDisplayLocal = postSorted.map((q, i) => ({
      ...q,
      __phase: "postBid",
      __displayRank: `PB${i + 1}`,
    }));

    const bestByTransporter = (arr) => {
      const m = new Map();
      for (const q of arr) {
        const tid = String(asId(q?.transportUser) || q?.transportUser || "");
        if (!tid) continue;

        const prev = m.get(tid);
        if (!prev) {
          m.set(tid, q);
          continue;
        }

        const p0 = prev?.price ?? Infinity;
        const p1 = q?.price ?? Infinity;

        if (p1 < p0) m.set(tid, q);
        else if (p1 === p0) {
          const t0 = prev?.createdAt ? new Date(prev.createdAt).getTime() : 0;
          const t1 = q?.createdAt ? new Date(q.createdAt).getTime() : 0;
          if (t1 > t0) m.set(tid, q);
        }
      }
      return m;
    };

    const bestNormal = bestByTransporter(normalSorted);
    const bestPost = bestByTransporter(postSorted);

    const transporterIds = new Set([...bestNormal.keys(), ...bestPost.keys()]);
    const effective = [];
    const effectiveIdByT = new Map();

    for (const tid of transporterIds) {
      const q = bestPost.get(tid) || bestNormal.get(tid);
      if (q) {
        effective.push(q);
        effectiveIdByT.set(tid, String(q._id));
      }
    }

    effective.sort(sortByPriceThenTime);

    const effRankByT = new Map();
    const aliasByT = new Map();

    effective.forEach((q, i) => {
      const tid = String(asId(q?.transportUser) || q?.transportUser || "");
      if (!tid) return;
      effRankByT.set(tid, `L${i + 1}`);
      aliasByT.set(tid, i + 1);
    });

    return {
      normalDisplay: normalDisplayLocal,
      postBidDisplay: postBidDisplayLocal,
      effectiveOrdered: effective,
      aliasByTransporter: aliasByT,
      effectiveRankByTransporter: effRankByT,
      effectiveIdByTransporter: effectiveIdByT,
    };
  }, [responses, biddingEndMs, postBidEndMs]);

  const selectionMetaByQuotationId = useMemo(() => {
    const map = {};
    const hist = tender?.selectionHistory || [];

    for (const e of hist) {
      const q = e?.quotation ? String(e.quotation) : null;
      if (!q) continue;

      if (["reject", "reopen", "remove"].includes(e.action)) {
        map[q] = {
          action: e.action,
          reason: e.reason || "",
          byRole: e.byRole || "system",
        };
      }
    }

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
  for (const r of effectiveOrdered) {
    if (r?.eligible === false) rejectedSet.add(String(r._id));
  }

  const actionableQuotationId = (() => {
    const sel = tender?.selection || {};
    const status = sel.status;
    const selQ = sel.quotation ? String(sel.quotation) : null;

    if ((status === "pending" || status === "confirmed") && selQ) return selQ;

    if (status === "rejected" && selQ) {
      const start = effectiveOrdered.findIndex((r) => String(r._id) === selQ);
      const s = start === -1 ? -1 : start;

      for (let i = s + 1; i < effectiveOrdered.length; i++) {
        const id = String(effectiveOrdered[i]._id);
        if (!rejectedSet.has(id)) return id;
      }
      return null;
    }

    for (let i = 0; i < effectiveOrdered.length; i++) {
      const id = String(effectiveOrdered[i]._id);
      if (!rejectedSet.has(id)) return id;
    }
    return null;
  })();

  const allCount = (normalDisplay?.length || 0) + (postBidDisplay?.length || 0);

  // ===============================
  //     ✅ ACCORDION STATE
  // ===============================
  const [openResponseId, setOpenResponseId] = useState(null);

  const allVisibleIds = useMemo(() => {
    const ids = new Set();
    for (const r of postBidDisplay) if (r?._id) ids.add(String(r._id));
    for (const r of normalDisplay) if (r?._id) ids.add(String(r._id));
    return ids;
  }, [postBidDisplay, normalDisplay]);

  useEffect(() => {
    const preferred =
      (selectedQuotationId && String(selectedQuotationId)) ||
      (actionableQuotationId && String(actionableQuotationId)) ||
      (postBidDisplay?.[0]?._id && String(postBidDisplay[0]._id)) ||
      (normalDisplay?.[0]?._id && String(normalDisplay[0]._id)) ||
      null;

    setOpenResponseId((prev) => {
      if (prev && allVisibleIds.has(prev)) return prev;
      return preferred;
    });
  }, [
    tender?._id,
    selectedQuotationId,
    actionableQuotationId,
    postBidDisplay?.length,
    normalDisplay?.length,
    postBidDisplay?.[0]?._id,
    normalDisplay?.[0]?._id,
    allVisibleIds,
  ]);

  const toggleOpen = (qid) => {
    setOpenResponseId((prev) => (prev === qid ? null : qid));
  };

  const getMaskedOrRealTransporterName = (transporter, index = 0, aliasNo) => {
    const isFinalized =
      String(tender?.status || "").toLowerCase() === "finalized";

    const displayIndex = Number(aliasNo || index + 1);

    if (!isFinalized) {
      return `Transporter ${displayIndex}`;
    }

    return (
      getTransporterName?.(transporter, tender, displayIndex - 1) ||
      `Transporter ${displayIndex}`
    );
  };

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
      ) : allCount === 0 ? (
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
        <div className="space-y-6">
          {/* ✅ POST BID BLOCK */}
          {postBidDisplay.length > 0 && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <div className="text-sm font-semibold text-indigo-800">Post Bid Responses</div>
                  <div className="text-xs text-indigo-700/80">Improved quotes submitted during post-bid window</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full border border-indigo-200 bg-white text-indigo-700">
                  {postBidDisplay.length} response(s)
                </span>
              </div>

              <div className="space-y-3">
                {postBidDisplay.map((res, idx) => {
                  const tid = String(asId(res?.transportUser) || res?.transportUser || "");
                  const aliasNo = aliasByTransporter.get(tid);
                  const effectiveRank = effectiveRankByTransporter.get(tid);
                  const effId = effectiveIdByTransporter.get(tid);
                  const isEffectiveQuote = effId && String(res._id) === String(effId);
                  const qid = String(res._id || `post-${idx}`);

                  return (
                    <TransporterResponseItem
                      key={res._id || `post-${idx}`}
                      response={res}
                      idx={idx}
                      transporterDisplayName={getMaskedOrRealTransporterName(
                        res.transportUser,
                        idx,
                        aliasNo
                      )}
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
                      requestingConfirmByQ={requestingConfirmByQ}
                      phase="postBid"
                      displayRank={res.__displayRank}
                      effectiveRank={effectiveRank}
                      aliasNo={aliasNo}
                      isEffectiveQuote={isEffectiveQuote}
                      // ✅ ACCORDION PROPS
                      isOpen={openResponseId === qid}
                      onToggle={() => toggleOpen(qid)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ✅ NORMAL BLOCK */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Normal Bids</div>
                <div className="text-xs text-slate-500">Quotes submitted during normal bidding window</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                {normalDisplay.length} response(s)
              </span>
            </div>

            <div className="space-y-3">
              {normalDisplay.map((res, idx) => {
                const tid = String(asId(res?.transportUser) || res?.transportUser || "");
                const aliasNo = aliasByTransporter.get(tid);
                const effectiveRank = effectiveRankByTransporter.get(tid);
                const effId = effectiveIdByTransporter.get(tid);
                const isEffectiveQuote = effId && String(res._id) === String(effId);
                const qid = String(res._id || `normal-${idx}`);

                return (
                  <TransporterResponseItem
                    key={res._id || `normal-${idx}`}
                    response={res}
                    idx={idx}
                    transporterDisplayName={getMaskedOrRealTransporterName(
                      res.transportUser,
                      idx,
                      aliasNo
                    )}
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
                    requestingConfirmByQ={requestingConfirmByQ}
                    phase="normal"
                    displayRank={res.__displayRank}
                    effectiveRank={effectiveRank}
                    aliasNo={aliasNo}
                    isEffectiveQuote={isEffectiveQuote}
                    // ✅ ACCORDION PROPS
                    isOpen={openResponseId === qid}
                    onToggle={() => toggleOpen(qid)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransporterResponses;