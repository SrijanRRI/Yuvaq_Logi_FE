import { useState, useMemo } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { Clock, Search, Filter, X, Calendar, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import API from "../../API"

import { ConfirmationModal } from "../../modals/ConfirmationModal"
import TenderCard from "./TenderCard"
import TransporterResponses from "./TransporterResponses"
import TenderDetails from "./TenderDetails"
import AttachmentPreviewModal from "../../modals/AttachmentPreviewModal"
import ReopenConfirmationModal from "../../modals/ReopenConfirmationModal"
import { TenderTermsModal } from "../../modals/TenderTermsModal"
import { loadRazorpayScript } from "../../lib/loadRazorpay"
import { calcAdvancePayment, toNumber } from "../../lib/tenderPayment";

const TenderHistoryAccordion = ({ tenderHistories = [], transporterList = [], fetchTenderHistory,
  page = 1,
  limit = 10,
  totalPages = 1,
  totalCount = 0,
  onPageChange = () => { },
  onLimitChange = () => { },
  loading = false,
  scope = "mine",
  onScopeChange = () => { },
  currentUserName = "You", }) => {
  const [openIdx, setOpenIdx] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [priceInput, setPriceInput] = useState("")
  const [confirmedIdxMap, setConfirmedIdxMap] = useState({})
  const [allResponses, setAllResponses] = useState({})
  const [previewFile, setPreviewFile] = useState(null)
  // const [confirmDialog, setConfirmDialog] = useState(null)
  const [reopenModalTenderId, setReopenModalTenderId] = useState(null)

  const [fetchedResponseIds, setFetchedResponseIds] = useState(new Set())
  const [responseErrors, setResponseErrors] = useState({})

  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [isFinalizing, setIsFinalizing] = useState(false)

  const [termsFinalize, setTermsFinalize] = useState(null)

  const getTransporterName = (transporter) => {
    if (!transporter) return "Unknown"
    if (typeof transporter === "object") {
      return transporter.name || transporter.email || transporter._id
    }
    const found = transporterList.find((t) => t._id === transporter)
    return found ? found.name || found.email : transporter
  }

  const toggleResponses = (idx, tenderId) => {
    setOpenIdx((prev) => (prev === idx ? null : idx))

    if (fetchedResponseIds.has(tenderId) || responseErrors[tenderId]) return

    axios
      .get(`${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setAllResponses((prev) => ({ ...prev, [tenderId]: res.data.data }))
        setFetchedResponseIds((prev) => new Set(prev).add(tenderId))
      })
      .catch((err) => {
        const errorMessage =
          err?.response?.data?.err || err?.response?.data?.message || "Could not load transporter responses."

        setResponseErrors((prev) => ({ ...prev, [tenderId]: errorMessage }))
      })
  }

  const handleDone = ({ tender, quotation }) => {
    if (!quotation?._id) {
      toast.error("Quotation not found. Please refresh and try again.");
      return;
    }

    const finalPricePerMt = Number(quotation.price); // per MT
    if (!Number.isFinite(finalPricePerMt) || finalPricePerMt <= 0) {
      toast.error("Invalid price per MT.");
      return;
    }

    // Prefer tender.totalWeight; fallback to sum of materials
    const totalWeightMt =
      toNumber(tender.totalWeight) ||
      (tender.materials || []).reduce((sum, m) => sum + toNumber(m.weight), 0);

    if (!Number.isFinite(totalWeightMt) || totalWeightMt <= 0) {
      toast.error("Total weight (MT) is missing. Please check tender totals.");
      return;
    }

    const calc = calcAdvancePayment({
      pricePerMt: finalPricePerMt,
      totalWeightMt,
      percent: 5,
    });

    // ✅ Open terms modal with full breakdown
    setTermsFinalize({
      tenderId: tender._id,
      quotationId: quotation._id,
      finalPricePerMt,
      totalWeightMt: calc.totalWeightMt,
      totalRupees: calc.totalRupees,
      advancePercent: calc.percent,
      advanceRupees: calc.advanceRupees,
      advancePaise: calc.advancePaise,
    });
  };

  const proceedFinalizeAfterTerms = async ({
    tenderId,
    quotationId,
    finalPricePerMt,
    totalWeightMt,
    advancePaise,
    advanceRupees,
    totalRupees,
    advancePercent,
  }) => {
    setIsFinalizing(true);

    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error("Razorpay SDK failed to load. Check internet.");
        setIsFinalizing(false);
        return;
      }

      const token = localStorage.getItem("session_token");

      // ✅ create order for advance only (5% in paise)
      const orderRes = await axios.post(
        `${API.FINALIZE_TENDER_CREATE_ORDER}/${tenderId}/finalize/payment/order`,
        {
          quotationId,
          finalPricePerMt,     // per MT (for backend validation)
          totalWeightMt,       // for backend validation
          advancePercentNotice: advancePercent, // optional (backend can ignore)
          // do NOT trust client amount; backend should compute again
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const { keyId, orderId, amount, currency } = orderRes.data;
      // amount should be advancePaise computed by backend (authoritative)

      const options = {
        key: keyId,
        amount, // paise (advance only)
        currency,
        name: "YuvaQ",
        description: `Advance Payment (${advancePercent}% of total) • ₹${Number(advanceRupees).toLocaleString()} (Total ₹${Number(totalRupees).toLocaleString()})`,
        order_id: orderId,

        handler: async function (response) {
          const token = localStorage.getItem("session_token");
          const authCfg = {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          };

          try {
            // 1) Verify payment
            await axios.post(
              `${API.FINALIZE_TENDER_VERIFY_PAYMENT}/${tenderId}/finalize/payment/verify`,
              {
                quotationId,
                finalPricePerMt,
                totalWeightMt,
                advancePercent: advancePercent,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              authCfg
            );

            // 2) Keep your existing finalize side-effects
            const finalizeRes = await axios.put(
              `${API.FINALIZE_TENDER}/${tenderId}`,
              { quotationId, finalPrice: finalPricePerMt }, // keep as per-MT in your DB if that’s your model
              authCfg
            );

            // NEW: toast based on backend email status (doesn't affect Razorpay errors)
            if (finalizeRes?.data?.emailSent === true) {
              toast.success("Email notification sent to transporter.");
            } else if (finalizeRes?.data?.emailSent === false) {
              toast.warn("Tender finalized, but email could not be sent.");
            }

            toast.success("Payment successful. Tender finalized!");
            setTermsFinalize(null);
            if (fetchTenderHistory) await fetchTenderHistory();
          } catch (e) {
            toast.error(e?.response?.data?.message || "Payment succeeded but finalization failed.");
          } finally {
            setIsFinalizing(false);
          }
        },

        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled/closed.");
            setIsFinalizing(false);
          },
        },

        theme: { color: "#059669" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        toast.error(resp?.error?.description || "Payment failed");
        setIsFinalizing(false);
      });

      rzp.open();
    } catch (err) {
      toast.error("Could not start payment.");
      setIsFinalizing(false);
    }
  };

  const handleReopenSubmit = async (reason) => {
    if (!reason.trim()) {
      toast.error("Please provide a reason to reopen the quotation.")
      return
    }

    try {
      await axios.post(`${API.REOPEN_QUOTATION}/${reopenModalTenderId}`, { reason }, { withCredentials: true })

      toast.success("Quotation reopened successfully")

      setConfirmedIdxMap((prev) => {
        const copy = { ...prev }
        delete copy[reopenModalTenderId]
        return copy
      })

      setPriceInput("")
      if (fetchTenderHistory) await fetchTenderHistory()

      setFetchedResponseIds((prev) => {
        const updated = new Set(prev)
        updated.delete(reopenModalTenderId)
        return updated
      })
    } catch {
      toast.error("Failed to reopen quotation")
    } finally {
      setReopenModalTenderId(null)
    }
  }

  const handleReopen = (tenderId) => {
    setReopenModalTenderId(tenderId)
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const clearSearch = () => setSearchQuery("")
  const clearFilters = () => {
    setStatusFilter("all")
    setDateRange({ from: "", to: "" })
  }

  // 🔎 Apply search + filters to CURRENT PAGE results
  const filteredTenders = useMemo(() => {
    return tenderHistories.filter((t) => {
      const matchSearch = [t.projectName, t.dispatchLocation, t.projectCode].some((val) =>
        (val || "").toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchStatus = statusFilter === "all" || (t.status || "").toLowerCase() === statusFilter.toLowerCase();

      let matchDate = true;
      if (dateRange.from && dateRange.to && t.deliveryWindow?.from && t.deliveryWindow?.to) {
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);
        const dwFrom = new Date(t.deliveryWindow.from);
        const dwTo = new Date(t.deliveryWindow.to);
        to.setHours(23, 59, 59, 999);
        matchDate = dwFrom >= from && dwTo <= to;
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [tenderHistories, searchQuery, statusFilter, dateRange]);

  // ========== Pagination Controls ==========
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const onFirst = () => canPrev && onPageChange(1);
  const onPrev = () => canPrev && onPageChange(page - 1);
  const onNext = () => canNext && onPageChange(page + 1);
  const onLast = () => canNext && onPageChange(totalPages);

  const pageStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const pageEnd = Math.min(page * limit, totalCount);

  const ScopeChip = ({ value, label, desc, activeClass }) => (
    <button
      onClick={() => onScopeChange(value)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
        ${scope === value
          ? `${activeClass} text-white shadow-md scale-105`
          : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"}`}
      title={desc}
    >
      {scope === value && <span className="mr-1">•</span>}
      {label}
    </button>
  );

  // ✅ Build deterministic aliases like "Transporter 1", "Transporter 2" for a given response list
  const buildAliasResolver = (sortedResponses = []) => {
    const map = new Map(); // key -> number
    let counter = 1;

    for (const r of sortedResponses) {
      const key = asId(r?.transportUser) || r?._id || String(counter);
      if (!map.has(key)) map.set(key, counter++);
    }

    return (r) => {
      const key = asId(r?.transportUser) || r?._id;
      const n = map.get(key);
      return `Transporter ${n ?? "—"}`;
    };
  };

  // ✅ Toggle (later you can make it config-based)
  const MASK_TRANSPORTER_NAMES_IN_EXPORT = true;


  // ---------- EXPORT HELPERS ----------
  const htmlEscape = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  const formatDatePretty = (d) => (d ? formatDate(d) : "-")
  const formatDateTimePretty = (d) => (d ? formatDateTime(d) : "-")

  const asId = (x) => (x && typeof x === "object" ? x._id : x)

  // Use transporterList prop to resolve a name/email from an id
  const getNameFromList = (idOrObj, transporterList = []) => {
    const id = asId(idOrObj)
    const found = transporterList.find((t) => t._id === id)
    return found?.name || found?.email || id
  }

  // ===============================
  //     PRINTABLE HTML (A4)
  // ===============================
  const buildPrintableHTML = (tender, responses = [], transporterList = [], maskNames = true) => {
    const materials = tender.materials || []

    // Sort responses by rank then price (same as Excel)
    const rankOrder = ["L1", "L2", "L3", "L4", "L5", "L6"]
    const orderIndex = (r) => {
      const i = rankOrder.indexOf(r || "")
      return i === -1 ? 999 : i
    }
    const sortedResponses = (responses || []).slice().sort((a, b) => {
      const ri = orderIndex(a.rank) - orderIndex(b.rank)
      if (ri !== 0) return ri
      return (a.price ?? Infinity) - (b.price ?? Infinity)
    })

    const getAliasName = buildAliasResolver(sortedResponses);

    const isFinalized = tender.status === "finalized"
    const selectedQuotationId = tender?.selectedQuotation?._id || null

    const hasQuotes = sortedResponses.length > 0;

    const rows = hasQuotes ? sortedResponses.map((r) => {

      // const name = r.name || getNameFromList(r.transportUser, transporterList) || "-"

      const name = (maskNames && MASK_TRANSPORTER_NAMES_IN_EXPORT)
        ? getAliasName(r)
        : (r.name || getNameFromList(r.transportUser, transporterList) || "-");

      const isThisFinal =
        isFinalized &&
        (
          r._id === selectedQuotationId ||
          asId(r.transportUser) === asId(tender.selectedQuotation?.transportUser) ||
          asId(r.transportUser) === tender.finalTransporter
        )

      const rawAmount =
        isThisFinal && tender.finalPrice != null
          ? `₹${Number(tender.finalPrice).toLocaleString()}`
          : r.price != null
            ? `₹${Number(r.price).toLocaleString()}`
            : "-"

      const vehicle = r.vehicleNumber || "-"
      const quotedAt = r.createdAt
        ? new Date(r.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        : "-"

      return {
        name,
        rank: r.rank || "-",
        amount: rawAmount,
        vehicle,
        quotedAt,
        status: isThisFinal ? "FINALIZED ✅" : "—",
        isFinal: !!isThisFinal,
      }
    }) : [];

    // Build HTML
    return `
    <!doctype html>
    <html>
    <head>
    <meta charset="utf-8" />
    <title>Tender Report - ${htmlEscape(tender.projectName || tender.projectCode || "Tender")}</title>
    <style>
      /* ==== Compact, one-page friendly styles (only CSS changed) ==== */
      :root{
        --fs-body: 11px;
        --fs-small: 10px;
        --fs-head: 12px;
        --fs-title: 14px;
        --pad-s: 6px;
        --pad-m: 8px;
        --gap: 8px;
        --radius: 6px;
      }

      @page { size: A4; margin: 8mm; }

      @media print {
        html, body { width: 210mm; height: 297mm; }
        body { zoom: 0.92; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table, tr, td, th, h3, .item, .totalBox { page-break-inside: avoid !important; }
      }

      body {
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        color: #0f172a;
        font-size: var(--fs-body);
        line-height: 1.35;
        margin: 0;
      }

      .header {
        display:flex; align-items:center; justify-content:space-between;
        border-bottom:1px solid #e2e8f0; padding-bottom: var(--pad-s); margin-bottom: var(--pad-s);
      }
      .brand { font-weight:800; font-size: 13px; color:#059669; letter-spacing:0.3px; }
      .title { font-size: var(--fs-title); font-weight:700; margin: 4px 0 2px; }
      .badge {
        font-size: var(--fs-small); border:1px solid #bae6fd; background:#e0f2fe; color:#0369a1;
        padding:2px 6px; border-radius:999px;
      }

      h3 { margin: 10px 0 6px; font-size: var(--fs-head); color:#334155; }

      .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 6px var(--gap); }
      .item {
        background:#f8fafc; border:1px solid #e2e8f0; border-radius: var(--radius); padding: var(--pad-s);
      }
      .label { font-size: var(--fs-small); color:#64748b; margin-bottom:2px; }
      .value { font-weight:600; }

      table {
        width:100%; border-collapse:collapse; margin-top:6px; font-size: 10px; table-layout: fixed;
      }
      th { text-align:left; background:#f1f5f9; color:#334155; }
      th, td { border:1px solid #e2e8f0; padding: 6px; vertical-align:top; word-break: break-word; }

      .totals { display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:6px; }
      .totalBox {
        background:#ecfeff; border:1px solid #cffafe; border-radius: var(--radius); padding: var(--pad-s);
      }
      .tr-final { background:#ecfdf5; } /* green tint for finalized row */
      .small { font-size: var(--fs-small); color:#64748b; }

      .footer {
        margin-top: 10px; border-top:1px dashed #cbd5e1; padding-top: 6px;
        font-size: var(--fs-small); color:#64748b; display:flex; justify-content:space-between;
      }
    </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">RRI • Tender Report</div>
        <div class="badge">${htmlEscape(tender.status || "Pending")}</div>
      </div>

      <div class="title">${htmlEscape(tender.projectName || `Tender for ${tender.dispatchLocation || "Location"}`)}</div>

      <h3>Project Details</h3>
      <div class="grid">
        <div class="item"><div class="label">Project Name</div><div class="value">${htmlEscape(tender.projectName || "-")}</div></div>
        <div class="item"><div class="label">Project Code</div><div class="value">${htmlEscape(tender.projectCode || "-")}</div></div>
        <div class="item" style="grid-column: span 2;"><div class="label">Purchase Order</div><div class="value">${htmlEscape(tender.purchaseOrder || "-")}</div></div>
      </div>

      <h3>Windows & Dates</h3>
      <div class="grid">
        <div class="item"><div class="label">Delivery Window</div><div class="value">${tender.deliveryWindow?.from && tender.deliveryWindow?.to
        ? `${formatDatePretty(tender.deliveryWindow.from)} → ${formatDatePretty(tender.deliveryWindow.to)}`
        : "-"
      }</div></div>
        <div class="item"><div class="label">Bidding Window</div><div class="value">${tender.biddingStart && tender.biddingEnd
        ? `${formatDateTimePretty(tender.biddingStart)} → ${formatDateTimePretty(tender.biddingEnd)}`
        : "-"
      }</div></div>
        <div class="item"><div class="label">Closing Date</div><div class="value">${formatDatePretty(tender.closeDate)}</div></div>
        <div class="item"><div class="label">Created</div><div class="value">${formatDatePretty(tender.createdAt)}</div></div>
      </div>

      <h3>Location</h3>
      <div class="item"><div class="label">Dispatch Address</div><div class="value">${htmlEscape(
        [tender.dispatchLocation, tender.address, tender.pincode].filter(Boolean).join(", ")
      )}</div></div>

      ${tender.projectRemark ? `<h3>Project Remark</h3><div class="item"><div class="value">${htmlEscape(tender.projectRemark)}</div></div>` : ""}

      <h3>Materials</h3>
      ${(materials || []).length
        ? `<table>
              <thead><tr><th>Material</th><th>Sub Item</th><th>Weight (MT)</th><th>Quantity (pcs)</th></tr></thead>
              <tbody>
                ${materials
          .map(
            (m) => `
                      <tr>
                        <td>${htmlEscape(m.material || "-")}</td>
                        <td>${htmlEscape(m.subMaterial || "-")}</td>
                        <td>${m.weight ?? "-"}</td>
                        <td>${m.quantity ?? "-"}</td>
                      </tr>`
          )
          .join("")}
              </tbody>
            </table>`
        : `<div class="item"><div class="value">No materials added</div></div>`
      }

      <div class="totals">
        <div class="totalBox"><div class="label">Total Weight</div><div class="value">${tender.totalWeight ?? "-"} MT</div></div>
        <div class="totalBox"><div class="label">Total Quantity</div><div class="value">${tender.totalQuantity ?? "-"} pcs</div></div>
      </div>

      <!-- NEW: Bidding Rule -->
      <div class="totals" style="margin-top:6px;">
        <div class="totalBox" style="grid-column: span 2;">
          <div class="label">Price Difference Rule</div>
          <div class="value">₹${tender.priceDifference != null ? Number(tender.priceDifference).toLocaleString() : "-"} (minimum decrement to beat L1)</div>
          <div class="small">Example: If L1 is ₹300 and price difference is ₹20, next valid quote must be ₹280 or lower.</div>
        </div>
      </div>

      <h3>Transporter Responses</h3>
      ${rows.length
        ? `<table>
              <thead>
                <tr>
                  <th>${(maskNames && MASK_TRANSPORTER_NAMES_IN_EXPORT) ? "Transporter" : "Name / Email"}</th>
                  <th>Rank</th>
                  <th>Amount (₹)</th>
                  <th>Vehicle No</th>
                  <th>Quoted At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows
          .map(
            (r) => `
                      <tr class="${r.isFinal ? "tr-final" : ""}">
                        <td>${htmlEscape(r.name)}</td>
                        <td>${htmlEscape(r.rank)}</td>
                        <td>${htmlEscape(r.amount)}</td>
                        <td>${htmlEscape(r.vehicle)}</td>
                        <td>${htmlEscape(r.quotedAt)}</td>
                        <td>${htmlEscape(r.status)}</td>
                      </tr>`
          )
          .join("")}
              </tbody>
            </table>`
        : `<div class="item"><div class="value"> Transporters haven't submitted any quotations for this tender </div></div>`
      }

      ${tender.remarks ? `<h3>Remarks</h3><div class="item"><div class="value">${htmlEscape(tender.remarks)}</div></div>` : ""}

      <div class="footer">
        <div>Generated: ${new Date().toLocaleString("en-GB")}</div>
        <div>Tender ID: ${htmlEscape(tender._id || "-")}</div>
      </div>
    </body>
    </html>`
  }

  // =====================================
  //   PRINT WITHOUT POPUPS (hidden IFRAME)
  // =====================================
  const handleExportPDF = (tender, responses = [], transporterList = []) => {
    const html = buildPrintableHTML(tender, responses, transporterList , true)

    // Create a Blob URL for the HTML
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    // Hidden iframe technique (no popup/new tab)
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    iframe.src = url

    iframe.onload = () => {
      try {
        // give the browser a moment to paint styles
        setTimeout(() => {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
          // cleanup
          setTimeout(() => {
            URL.revokeObjectURL(url)
            iframe.remove()
          }, 1000)
        }, 150)
      } catch (e) {
        // cleanup on error
        URL.revokeObjectURL(url)
        iframe.remove()
      }
    }

    document.body.appendChild(iframe)
  }


  // function of export Excel : 
  const handleExportExcel = (tender, responses = []) => {
    // Helpers
    const rows = []
    const push = (a, b) => rows.push([a, b])
    const csvEscape = (v) => {
      if (v === null || v === undefined) return ""
      const s = String(v)
      if (s.includes(",") || s.includes("\n") || s.includes('"')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const safeJoin = (arr) => (arr || []).filter(Boolean).join(", ")
    const asId = (x) => (x && typeof x === "object" ? x._id : x) // ✅ define helper

    // Finalized context
    const isFinalized = tender.status === "finalized"
    const selectedQuotationId = tender?.selectedQuotation?._id || null

    // Sort responses by rank then price
    const rankOrder = ["L1", "L2", "L3", "L4", "L5", "L6"]
    const orderIndex = (r) => {
      const i = rankOrder.indexOf(r || "")
      return i === -1 ? 999 : i
    }
    const sortedResponses = (responses || []).slice().sort((a, b) => {
      const ri = orderIndex(a.rank) - orderIndex(b.rank)
      if (ri !== 0) return ri
      return (a.price ?? Infinity) - (b.price ?? Infinity)
    })

    const getAliasName = buildAliasResolver(sortedResponses);

    const asText = (v) => (v == null ? "" : `\u200C${String(v)}`)

    // =========================
    //        TENDER SUMMARY
    // =========================
    rows.push(["==== TENDER SUMMARY ====", ""])
    push("Project Name", tender.projectName || "-")
    push("Project Code", tender.projectCode || "-")
    push("Purchase Order", tender.purchaseOrder || "-")
    if (tender.projectRemark) push("Project Remark", tender.projectRemark)
    push(
      "Delivery Window",
      tender.deliveryWindow?.from && tender.deliveryWindow?.to
        ? `${formatDate(tender.deliveryWindow.from)} to ${formatDate(tender.deliveryWindow.to)}`
        : "-"
    )
    push(
      "Bidding Window",
      tender.biddingStart && tender.biddingEnd
        ? `${formatDateTime(tender.biddingStart)} to ${formatDateTime(tender.biddingEnd)}`
        : "-"
    )
    push("Closing Date", tender.closeDate ? formatDate(tender.closeDate) : "-")
    push("Status", tender.status || "Pending")
    push("Created", tender.createdAt ? formatDate(tender.createdAt) : "-")
    push("Dispatch Address", safeJoin([tender.dispatchLocation, tender.address, tender.pincode]))

    rows.push([])
    rows.push(["==== TOTALS ====", ""])
    push("Total Weight (MT)", tender.totalWeight ?? "-")
    push("Total Quantity (pcs)", tender.totalQuantity ?? "-")

    // NEW: Price Difference rule line
    rows.push([])
    rows.push(["==== BIDDING RULE ====", ""])
    push(
      "Price Difference (₹) — min decrement to beat L1",
      tender.priceDifference != null ? `₹${Number(tender.priceDifference).toLocaleString()}` : "-"
    )

    // =========================
    //          MATERIALS
    // =========================
    rows.push([])
    rows.push(["==== MATERIALS ====", ""])
    rows.push(["Material", "Sub Item", "Weight (MT)", "Quantity (pcs)"])
      ; (tender.materials || []).forEach((m) => {
        rows.push([m.material || "-", m.subMaterial || "-", asText(m.weight ?? "-"), asText(m.quantity ?? "-")])
      })
    if (!tender.materials || tender.materials.length === 0) {
      rows.push(["No materials added", ""])
    }

    // =========================
    //        TRANSPORTERS
    // =========================
    rows.push([])
    rows.push(["==== TRANSPORTERS ====", ""])
    // rows.push(["Name / Email", "Rank", "Amount (₹)", "Vehicle No", "Quoted At", "Status"])
    rows.push(["Transporter", "Rank", "Amount (₹)", "Vehicle No", "Quoted At", "Status"])

    if (sortedResponses.length > 0) {
      sortedResponses.forEach((r) => {
        // const name = getTransporterName(r.transportUser) || "-"   // ✅ robust name resolver
        const name = (MASK_TRANSPORTER_NAMES_IN_EXPORT ? getAliasName(r) : (getTransporterName(r.transportUser) || "-"));

        const isThisFinal =
          isFinalized &&
          (
            r._id === selectedQuotationId ||
            asId(r.transportUser) === asId(tender.selectedQuotation?.transportUser) ||
            asId(r.transportUser) === tender.finalTransporter // supports your response shape
          )

        const statusLabel = isThisFinal ? "FINALIZED ✅" : "—"

        const rawAmount =
          isThisFinal && tender.finalPrice != null
            ? `₹${Number(tender.finalPrice).toLocaleString()}`
            : `₹${Number(r.price ?? 0).toLocaleString()}`

        const amount = asText(rawAmount)
        const vehicle = r.vehicleNumber || "-"
        const quotedAt = r.createdAt
          ? new Date(r.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          : "-"

        rows.push([name, r.rank || "-", amount, vehicle, quotedAt, statusLabel])
      });
    } else {
      rows.push(["Transporters haven't submitted any quotations for this tender", "", "", "", "", ""])
    }


    // =========================
    //          REMARKS
    // =========================
    if (tender.remarks) {
      rows.push([])
      rows.push(["==== REMARKS ====", ""])
      rows.push([tender.remarks, ""])
    }

    // CSV with UTF-8 BOM so Excel renders ₹ correctly
    const csv =
      "\ufeff" +
      rows.map((r) => (Array.isArray(r) ? r.map(csvEscape).join(",") : csvEscape(String(r)))).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const fileBase = (tender.projectCode || tender.projectName || "tender").replace(/\s+/g, "_")
    a.href = url
    a.download = `${fileBase}_report.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  // ---------- END EXPORT HELPERS ----------

  // Helper: compute rank if missing (by price asc)
  const ensureRanks = (arr = []) => {
    const sorted = arr.slice().sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    const labels = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9"];
    const byId = new Map(sorted.map((r, i) => [r._id, labels[i] || `L${i + 1}`]));
    return arr.map(r => ({ ...r, rank: r.rank || byId.get(r._id) || "-" }));
  };

  // Fetch on demand if needed, then export
  const exportWithResponses = async (tender, kind /* 'pdf' | 'excel' */) => {
    const tenderId = tender._id;
    let responses = allResponses[tenderId];

    if (!responses || !responses.length) {
      try {
        const res = await axios.get(`${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`, {
          withCredentials: true,
        });
        responses = res?.data?.data || [];
      } catch (e) {
        toast.error("Could not load transporter responses for export.");
        responses = [];
      }
    }

    const enriched = ensureRanks(responses);

    if (kind === "pdf") {
      handleExportPDF(tender, enriched, transporterList);
    } else {
      handleExportExcel(tender, enriched);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-20 -translate-y-20 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-800 opacity-20 rounded-full translate-x-10 translate-y-10 blur-xl"></div>
          <h1 className="text-2xl font-bold flex items-center gap-2 relative z-10">
            <Clock className="h-6 w-6 text-emerald-200" />
            Tender History
          </h1>
          <p className="mt-1 opacity-90 text-emerald-100">View and manage your past tenders</p>
        </div>

        <div className="p-6">

          {/* ===== Scope Selector + Search/Filter ===== */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* NEW: scope segmented control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show</span>
              <div className="flex gap-2">
                <ScopeChip
                  value="mine"
                  label="My tenders"
                  desc="Only tenders created by you"
                  activeClass="bg-gradient-to-r from-emerald-500 to-emerald-600"
                />
                <ScopeChip
                  value="all"
                  label="All tenders"
                  desc="All tenders in the database"
                  activeClass="bg-gradient-to-r from-sky-500 to-blue-600"
                />
              </div>
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full
                  ${scope === "mine" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
              >
                {scope === "mine" ? `Created by ${currentUserName}` : "Entire DB"}
              </span>
            </div>

            {/* (optional) keep your existing “Rows X-Y of Z” small label here too if you want */}
          </div>

          {/* Enhanced Search and Filter */}
          <div className="mb-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search
                  className={`h-5 w-5 ${searchFocused ? "text-emerald-500" : "text-slate-400"} transition-colors duration-300`}
                />
              </div>
              <input
                type="text"
                className={`w-full pl-12 pr-12 py-4 border-2 ${searchFocused ? "border-emerald-500 ring-4 ring-emerald-100" : "border-slate-200 hover:border-slate-300"
                  } rounded-xl focus:outline-none transition-all duration-300 shadow-sm focus:shadow-md`}
                placeholder="Search by project name, location or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`ml-1 p-2.5 rounded-full transition-all duration-300 ${filterOpen || statusFilter !== "all" || (dateRange.from && dateRange.to)
                    ? "bg-emerald-100 text-emerald-600 shadow-inner"
                    : "hover:bg-slate-100 text-slate-400"
                    }`}
                >
                  <Filter className="h-4 w-4" />
                  {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {(statusFilter !== "all" ? 1 : 0) + (dateRange.from || dateRange.to ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {filterOpen && (
              <div className="mt-4 p-5 bg-gradient-to-br from-slate-50 to-emerald-50 rounded-xl border border-slate-200 shadow-inner animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-emerald-800 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Tenders
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-emerald-600 hover:text-emerald-800 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className=" text-sm font-medium text-slate-700 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                      Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "All", className: "bg-gradient-to-r from-slate-500 to-slate-600" },
                        { value: "open", label: "Open", className: "bg-gradient-to-r from-amber-500 to-amber-600" },
                        { value: "closed", label: "Closed", className: "bg-gradient-to-r from-red-500 to-red-600" },
                        {
                          value: "finalized",
                          label: "Finalized",
                          className: "bg-gradient-to-r from-emerald-500 to-emerald-600",
                        },
                      ].map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setStatusFilter(status.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${statusFilter === status.value
                            ? `${status.className} text-white shadow-md scale-105`
                            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                            }`}
                        >
                          {statusFilter === status.value && <span className="mr-1">•</span>}
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className=" text-sm font-medium text-slate-700 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                      From Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-full pl-10 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className=" text-sm font-medium text-slate-700 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                      To Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-full pl-10 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active filters:</span>

                {statusFilter !== "all" && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${statusFilter === "finalized"
                      ? "bg-emerald-100 text-emerald-700"
                      : statusFilter === "open"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    Status: {statusFilter}
                  </span>
                )}

                {(dateRange.from || dateRange.to) && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    Date: {dateRange.from || "Any"} to {dateRange.to || "Any"}
                  </span>
                )}
              </div>
            )}

            {/* Count for current page after filters */}
            <div className="mb-4 text-sm flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {filteredTenders.length === 0 ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    No results found in this page
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Showing {filteredTenders.length} item(s) on this page
                  </div>
                )}
              </div>

              {/* 🔢 Global range across pages */}
              <div className="text-slate-500">
                {loading ? "Loading…" : `Rows ${pageStart}-${pageEnd} of ${totalCount}`}
              </div>
            </div>
          </div>

          {/* <div className="mb-4 text-sm flex items-center gap-2">
            {filteredTenders.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                No results found
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Showing {filteredTenders.length} of {tenderHistories.length} tenders
              </div>
            )}
          </div> */}

          {/* Tender List */}
          <div className="space-y-4">
            {filteredTenders.map((tender, idx) => {
              const tenderId = tender._id
              const selectedQuotationId = tender.selectedQuotation?._id
              const responses = allResponses[tenderId] || []

              return (
                <div
                  key={tenderId}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-emerald-200"
                >
                  <TenderCard
                    tender={tender}
                    isOpen={openIdx === idx}
                    onToggle={() => toggleResponses(idx, tenderId)}
                    onExportPDF={() => exportWithResponses(tender, 'pdf')}
                    onExportExcel={() => exportWithResponses(tender, 'excel')}
                  />

                  {openIdx === idx && (
                    <div className="border-t border-slate-200 p-5">
                      <TenderDetails tender={tender} getTransporterName={getTransporterName} />

                      <TransporterResponses
                        responses={responses}
                        tender={tender}
                        selectedQuotationId={selectedQuotationId}
                        confirmedIdxMap={confirmedIdxMap}
                        editingId={editingId}
                        priceInput={priceInput}
                        setEditingId={setEditingId}
                        setPriceInput={setPriceInput}
                        onConfirmFinal={handleDone}
                        onReopen={handleReopen}
                        getTransporterName={getTransporterName}
                        setPreviewFile={setPreviewFile}
                        responseError={responseErrors[tenderId]}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {!loading && filteredTenders.length === 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50 border border-slate-200 rounded-xl p-10 text-center">
                <div className="bg-white rounded-full p-4 inline-flex mb-3 shadow-sm">
                  <Search className="h-10 w-10 text-emerald-200" />
                </div>
                <p className="text-slate-700 font-medium mb-2">No tenders found</p>
                <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* ===== Pagination Bar ===== */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Page size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Rows per page</span>
              <select
                className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                disabled={loading}
              >
                {[5, 10, 20, 50, 100].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>

            {/* Pager */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                onClick={onFirst}
                disabled={!canPrev || loading}
                title="First"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                onClick={onPrev}
                disabled={!canPrev || loading}
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm text-slate-600 px-2">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                onClick={onNext}
                disabled={!canNext || loading}
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                onClick={onLast}
                disabled={!canNext || loading}
                title="Last"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>



      {previewFile && <AttachmentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      {reopenModalTenderId && (
        <ReopenConfirmationModal onConfirm={handleReopenSubmit} onCancel={() => setReopenModalTenderId(null)} />
      )}

      {termsFinalize && (
        <TenderTermsModal
          finalPricePerMt={termsFinalize.finalPricePerMt}
          totalWeightMt={termsFinalize.totalWeightMt}
          totalRupees={termsFinalize.totalRupees}
          advancePercent={termsFinalize.advancePercent}
          advanceRupees={termsFinalize.advanceRupees}
          isLoading={isFinalizing}
          onCancel={() => {
            if (!isFinalizing) setTermsFinalize(null)
          }}
          onAgree={() => proceedFinalizeAfterTerms(termsFinalize)}
        />
      )}

      {/* {confirmDialog && (
        <ConfirmationModal
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          isLoading={isFinalizing}
        />
      )} */}
    </div>
  )
}

export default TenderHistoryAccordion
