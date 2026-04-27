import {
  CheckCircle,
  FileText,
  RefreshCcw,
  Truck,
  Info,
  Loader2,
  ChevronDown,
} from "lucide-react";

const TransporterResponseItem = ({
  response,
  idx,
  tender,
  selectedQuotationId,
  confirmedIdxMap,
  editingId,
  onConfirmFinal,
  onReopen,
  getTransporterName,
  setPreviewFile,
  contact,
  contactLoading,
  onRevealContact,
  onRequestConfirmation,
  actionableQuotationId,
  selectionMetaByQuotationId,
  onProceedToPay,
  requestingConfirmByQ,
  phase,
  displayRank,
  effectiveRank,
  aliasNo,
  isEffectiveQuote,

  // ✅ ACCORDION
  isOpen = false,
  onToggle = () => { },
}) => {
  const tenderId = tender._id;

  const isFinalizedView =
    tender.status === "finalized" ||
    (tender.status === "closed" && tender.selectedQuotation && tender.finalPrice);

  const isSelected = response._id === selectedQuotationId;
  const isDimmed = isFinalizedView && !isSelected;

  const isBeforeOrOnClosingDay = () => {
    const now = new Date();
    const closeDateEnd = new Date(tender.closeDate);
    closeDateEnd.setHours(23, 59, 59, 999);
    return now <= closeDateEnd;
  };

  const reopenCount = tender.reopenCount || 0;
  const canReopen = reopenCount < 2;
  const canReopenQuotation = tender.status === "finalized" && canReopen && isBeforeOrOnClosingDay();

  const rankOrder = ["L1", "L2", "L3"];
  const allowedRankIndex = reopenCount;
  const currentRank = response.rank;
  const canConfirm = rankOrder[allowedRankIndex] === currentRank;

  const sel = tender.selection || {};
  const isPendingSelected = sel.status === "pending" && String(sel.quotation) === String(response._id);
  const isConfirmedSelected = sel.status === "confirmed" && String(sel.quotation) === String(response._id);
  const isSomeoneElsePending = sel.status === "pending" && !isPendingSelected;
  const isRejectedSelected = sel.status === "rejected" && String(sel.quotation) === String(response._id);

  const ineligible = response?.eligible === false;
  const qid = String(response._id);

  const isRequestingConfirm = !!requestingConfirmByQ?.[qid];

  const postBidStatus = String(tender?.postBid?.status || "").toLowerCase();
  const postBidEndsAtMs = tender?.postBid?.endsAt
    ? new Date(tender.postBid.endsAt).getTime()
    : null;

  const isPostBidTimerLive =
    phase === "postBid" &&
    postBidStatus === "active" &&
    postBidEndsAtMs &&
    Date.now() < postBidEndsAtMs;

  const meta = selectionMetaByQuotationId?.[qid];

  const historyAction = ineligible ? "remove" : meta?.action || null;
  const historyReason = ineligible ? (response?.removedReason || "") : (meta?.reason || "");

  const hasHistoryMessage =
    !!historyAction && (historyAction === "reject" || historyAction === "reopen" || historyAction === "remove");

  const historyTitle =
    historyAction === "reject" ? "Rejected by transporter" : "Removed (Tender Reopened)";

  const historySubtitle = historyReason ? `Reason: ${historyReason}` : "Reason: —";

  const isActionable = actionableQuotationId ? String(actionableQuotationId) === qid : false;

  const formatPhoneIN = (phone) => {
    if (!phone) return "-";
    let d = String(phone).replace(/\D/g, "");
    if (d.startsWith("00")) d = d.slice(2);
    if (d.length === 12 && d.startsWith("91")) {
      const cc = d.slice(0, 2);
      const num = d.slice(2);
      return `+${cc} ${num.slice(0, 5)} ${num.slice(5)}`;
    }
    if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
    if (d.length > 10) {
      const cc = d.slice(0, d.length - 10);
      const num = d.slice(-10);
      return `+${cc} ${num.slice(0, 5)} ${num.slice(5)}`;
    }
    return phone;
  };

  const telHref = (phone) => {
    const d = String(phone || "").replace(/\D/g, "");
    if (!d) return "";
    return d.length === 10 ? `tel:+91${d}` : `tel:+${d}`;
  };

  return (
    <div
      className={`rounded-lg sm:rounded-xl shadow-sm transition duration-300 overflow-hidden ${isDimmed
        ? "border border-slate-200 bg-slate-50"
        : isSelected
          ? "border-2 border-emerald-500 bg-white"
          : "border border-slate-200 bg-white"
        }`}
    >
      {/* ✅ ACCORDION HEADER (always visible) */}
      <div
        className={`${isSelected
          ? "bg-emerald-50 border-b border-emerald-100"
          : isDimmed
            ? "bg-slate-100 border-b border-slate-200"
            : "bg-indigo-50 border-b border-indigo-100"
          } px-4 sm:px-5 py-3`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* left */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2 rounded-full flex-shrink-0 ${isSelected ? "bg-emerald-100" : "bg-indigo-100"
                }`}
            >
              <Truck
                className={`h-4 w-4 sm:h-5 sm:w-5 ${isSelected ? "text-emerald-600" : "text-indigo-600"
                  }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h5 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                Transporter {aliasNo ?? idx + 1}
              </h5>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-emerald-200 to-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm shadow-md">
                  Rank: {displayRank || response.rank}
                </div>

                {phase === "postBid" && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-indigo-200 bg-white text-indigo-700 font-semibold">
                    POST BID
                  </span>
                )}

                {!!effectiveRank && effectiveRank !== (displayRank || response.rank) && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                    Overall: {effectiveRank}
                  </span>
                )}

                {isEffectiveQuote && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold">
                    Effective
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-slate-500">Price</div>
              <div className="text-sm font-bold text-emerald-700">
                ₹{Number(response?.price || 0).toLocaleString()}
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
              aria-expanded={isOpen}
              title={isOpen ? "Collapse" : "Expand"}
            >
              <ChevronDown
                className={`h-4 w-4 text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        {/* mobile price line */}
        <div className="sm:hidden mt-2 text-sm font-bold text-emerald-700">
          ₹{Number(response?.price || 0).toLocaleString()}
        </div>
      </div>

      {/* ✅ ACCORDION BODY (only when open) */}
      {isOpen && (
        <div className="p-4 sm:p-5">
          {/* ✅ Move contact block inside accordion to reduce overall height */}
          {isSelected && tender.status === "finalized" && (
            <div className="mb-4 bg-white border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-700">Transporter Contact</div>

                <button
                  onClick={onRevealContact}
                  className="text-xs px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                  disabled={contactLoading}
                  title="Reveal finalized transporter contact details"
                >
                  {contactLoading ? "Loading..." : contact ? "Hide" : "Reveal"}
                </button>
              </div>

              {contact ? (
                <div className="mt-2 text-sm text-slate-700 space-y-1">
                  <div>
                    <span className="text-slate-500">Name:</span> {contact.name || "-"}
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>{" "}
                    <a
                      href={`mailto:${contact.email || ""}`}
                      className="text-emerald-700 hover:underline font-medium break-all"
                    >
                      {contact.email || "-"}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>{" "}
                    <a
                      href={telHref(contact.phone)}
                      className="text-emerald-700 hover:underline font-medium"
                      title="Call transporter"
                    >
                      {formatPhoneIN(contact.phone)}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-500">Hidden until revealed.</div>
              )}
            </div>
          )}

          {/* Mobile Card Layout */}
          <div className="block sm:hidden space-y-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Price</p>
              <p className="text-xl font-bold text-emerald-600">
                ₹{Number(response.price || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Vehicle Detail</p>
              <p className="text-sm font-medium text-slate-700 break-words">
                {response.vehicleNumber || "Not specified"}
              </p>
            </div>

            {/* <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Attachments</p>
              <div className="text-xs text-slate-700 space-y-1.5 mt-1">
                {response?.files?.length > 0 ? (
                  response.files.map((file, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setPreviewFile({
                          url: file.url || file,
                          mimetype: file.mimetype || "",
                          originalName: file.originalName || `Attachment ${i + 1}`,
                        })
                      }
                      className="text-indigo-600 hover:text-indigo-800 hover:underline text-left flex items-center gap-1.5 py-1 w-full min-w-0"
                    >
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{file.originalName || `Attachment ${i + 1}`}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No attachments</p>
                )}
              </div>
            </div> */}

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Quoted At</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(response.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Price</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                ₹{Number(response.price || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Vehicle Detail</p>
              <p className="text-base sm:text-lg font-medium text-slate-700 break-words">
                {response.vehicleNumber || "Not specified"}
              </p>
            </div>

            {/* <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Attachments</p>
              <div className="text-sm text-slate-700 space-y-1.5 mt-1">
                {response?.files?.length > 0 ? (
                  response.files.map((file, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setPreviewFile({
                          url: file.url || file,
                          mimetype: file.mimetype || "",
                          originalName: file.originalName || `Attachment ${i + 1}`,
                        })
                      }
                      className="text-indigo-600 hover:text-indigo-800 hover:underline text-left flex items-center gap-1.5 py-1 w-full min-w-0"
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{file.originalName || `Attachment ${i + 1}`}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No attachments</p>
                )}
              </div>
            </div> */}

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Quoted At</p>
              <p className="text-base font-medium text-slate-700">
                {new Date(response.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 sm:mt-5">
            {isFinalizedView ? (
              isSelected ? (
                <div className="flex flex-col gap-4 bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="break-words">
                      Final Deal Price: ₹
                      {tender.finalPrice?.toLocaleString() ||
                        Number(response.price || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={() => onReopen(tenderId)}
                      disabled={!canReopenQuotation}
                      className={`px-3 sm:px-4 py-2 rounded-lg transition border flex items-center justify-center gap-2 text-sm sm:text-base ${canReopenQuotation
                        ? "text-indigo-600 border-indigo-300 bg-white hover:bg-indigo-50"
                        : "text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed"
                        }`}
                    >
                      <RefreshCcw className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {canReopenQuotation
                          ? "Reopen Quotation"
                          : !isBeforeOrOnClosingDay()
                            ? "Closed"
                            : "Max Reopens Reached"}
                      </span>
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                      <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Reopen Attempts: {reopenCount} / 2</span>
                    </div>
                  </div>
                </div>
              ) : hasHistoryMessage ? (
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                  <div className="text-sm font-semibold text-red-700">{historyTitle}</div>
                  <div className="text-xs mt-1 text-red-600">{historySubtitle}</div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 text-slate-500 text-xs sm:text-sm flex items-start gap-2">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="break-words">Not selected in finalization.</span>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3 bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                {hasHistoryMessage ? (
                  <div className="text-sm text-red-700">
                    <div className="font-semibold">{historyTitle}</div>
                    <div className="text-xs mt-1 text-red-600">{historySubtitle}</div>
                  </div>
                ) : isPendingSelected ? (
                  <div className="text-sm text-amber-700 font-medium">
                    Waiting for transporter confirmation…
                  </div>
                ) : isConfirmedSelected ? (
                  <button
                    onClick={() => onProceedToPay({ tender, quotation: response })}
                    className="px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    Proceed to Pay
                  </button>
                ) : isSomeoneElsePending ? (
                  <div className="text-sm text-slate-500">
                    Another selection is pending confirmation.
                  </div>
                ) : isActionable ? (
                  // <button
                  //   onClick={() => onRequestConfirmation({ tender, quotation: response })}
                  //   disabled={isRequestingConfirm}
                  //   className={`px-3 sm:px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base ${isRequestingConfirm ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  //     }`}
                  //  >
                  //   {isRequestingConfirm ? (
                  //     <>
                  //       <Loader2 className="h-4 w-4 animate-spin" />
                  //       Requesting...
                  //     </>
                  //   ) : (
                  //     <>Request Confirmation ({response.rank || "L1"})</>
                  //   )}
                  // </button>

                  <button
                    onClick={() => onRequestConfirmation({ tender, quotation: response })}
                    disabled={isRequestingConfirm || isPostBidTimerLive}
                    title={
                      isPostBidTimerLive
                        ? "Post-bid timer is live. You can request confirmation after the timer ends."
                        : ""
                    }
                    className={`px-3 sm:px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base ${isRequestingConfirm || isPostBidTimerLive
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                  >
                    {isRequestingConfirm ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>Request Confirmation ({displayRank || response.rank || "L1"})</>
                    )}
                  </button>
                ) : (
                  <div className="text-xs sm:text-sm text-slate-500 flex items-start gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="break-words">
                      Not eligible right now. Next request will go rank-wise after current decision.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransporterResponseItem;