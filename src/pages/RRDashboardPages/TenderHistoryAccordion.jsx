import { useState, useMemo, useEffect } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { Clock, Search, Filter, X, Calendar, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react"
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
import { exportTenderExcel, exportTenderPDF, normalizeResponses } from "../../lib/tenderExport"
import DeleteTenderModal from "../../modals/DeleteTenderModal"

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

  const [contactByTender, setContactByTender] = useState({});
  const [contactLoading, setContactLoading] = useState({});

  const [requestingConfirmByQ, setRequestingConfirmByQ] = useState({});

  // const [startingPostBid, setStartingPostBid] = useState({});
  // const [postBidDraftByTender, setPostBidDraftByTender] = useState({});

  const [nowMs, setNowMs] = useState(Date.now());

  const [deleteTender, setDeleteTender] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const canDeleteTender = (t) => {
    const bs = t?.biddingStart ? new Date(t.biddingStart).getTime() : null;
    if (!bs) return false;
    return Date.now() < bs && String(t?.status || "").toLowerCase() !== "cancelled";
  };

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000); // refresh every sec
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!fetchTenderHistory) return;

    const shouldRefresh = tenderHistories.some((t) => {
      const biddingEndMs = t?.biddingEnd ? new Date(t.biddingEnd).getTime() : null;
      const postBidStatus = String(t?.postBid?.status || "").toLowerCase();

      if (!biddingEndMs) return false;

      const now = Date.now();

      return (
        now >= biddingEndMs &&
        t.status !== "finalized" &&
        postBidStatus !== "ended"
      );
    });

    if (!shouldRefresh) return;

    const id = setInterval(() => {
      fetchTenderHistory(page, limit, scope);
    }, 15000);

    return () => clearInterval(id);
  }, [tenderHistories, fetchTenderHistory, page, limit, scope]);

  const fetchFinalizedContact = async (tenderId) => {
    if (!tenderId) return;

    // toggle: if already fetched, just toggle visibility (optional)
    if (contactByTender[tenderId]) {
      setContactByTender((p) => ({ ...p, [tenderId]: null }));
      return;
    }

    try {
      setContactLoading((p) => ({ ...p, [tenderId]: true }));

      const token = localStorage.getItem("session_token");
      const res = await axios.get(
        `${API.FETCH_FINALIZED_TRANSPORTER_CONTACT}/${tenderId}/finalized-contact`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      console.log("transporter contact ", res.data);

      const contact = res?.data?.data || res?.data;
      setContactByTender((p) => ({ ...p, [tenderId]: contact }));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not load transporter contact.");
    } finally {
      setContactLoading((p) => ({ ...p, [tenderId]: false }));
    }
  };

  // const getTransporterName = (transporter) => {
  //   if (!transporter) return "Unknown"
  //   if (typeof transporter === "object") {
  //     return transporter.name || transporter.email || transporter._id
  //   }
  //   const found = transporterList.find((t) => t._id === transporter)
  //   return found ? found.name || found.email : transporter
  // }

  const getAnonymousTransporterName = (transporter, index = 0) => {
    const id =
      typeof transporter === "object"
        ? String(transporter?._id || transporter?.id || "")
        : String(transporter || "");

    if (!id) return `Transporter ${index + 1}`;

    const list = Array.isArray(transporterList) ? transporterList : [];

    const foundIndex = list.findIndex((t) => String(t._id) === id);

    return `Transporter ${foundIndex >= 0 ? foundIndex + 1 : index + 1}`;
  };

  const getTransporterName = (transporter, tender, index = 0) => {
    const isFinalized =
      String(tender?.status || "").toLowerCase() === "finalized";

    if (!isFinalized) {
      return getAnonymousTransporterName(transporter, index);
    }

    if (!transporter) return "Unknown Transporter";

    if (typeof transporter === "object") {
      return (
        transporter.name ||
        transporter.email ||
        `Transporter ${index + 1}`
      );
    }

    const found = transporterList.find(
      (t) => String(t._id) === String(transporter)
    );

    return found?.name || found?.email || `Transporter ${index + 1}`;
  };

  // const toggleResponses = (idx, tenderId) => {
  //   setOpenIdx((prev) => (prev === idx ? null : idx))

  //   if (fetchedResponseIds.has(tenderId) || responseErrors[tenderId]) return

  //   axios
  //     .get(`${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`, {
  //       withCredentials: true,
  //     })
  //     .then((res) => {
  //       setAllResponses((prev) => ({ ...prev, [tenderId]: res.data.data }))
  //       setFetchedResponseIds((prev) => new Set(prev).add(tenderId))
  //     })
  //     .catch((err) => {
  //       const errorMessage =
  //         err?.response?.data?.err || err?.response?.data?.message || "Could not load transporter responses."

  //       setResponseErrors((prev) => ({ ...prev, [tenderId]: errorMessage }))
  //     })
  // }

  const toggleResponses = (idx, tenderId) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));

    if (!tenderId) return;

    // ✅ If data already loaded successfully, do not fetch again
    if (fetchedResponseIds.has(tenderId)) return;

    axios
      .get(`${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setAllResponses((prev) => ({
          ...prev,
          [tenderId]: res?.data?.data || res?.data,
        }));

        // ✅ Clear old live-bidding / post-bid expected message after successful fetch
        setResponseErrors((prev) => {
          const copy = { ...prev };
          delete copy[tenderId];
          return copy;
        });

        setFetchedResponseIds((prev) => new Set(prev).add(tenderId));
      })
      .catch((err) => {
        const errorMessage =
          err?.response?.data?.err ||
          err?.response?.data?.message ||
          "Could not load transporter responses.";

        // ✅ Do not add tenderId in fetchedResponseIds here.
        // So after bidding/post-bid completes, user can open again and data will fetch.
        setResponseErrors((prev) => ({
          ...prev,
          [tenderId]: errorMessage,
        }));
      });
  };

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

  const requestTransporterConfirm = async (tenderId, quotationId) => {
    await axios.post(
      `${API.REQUEST_SELECTION}/${tenderId}/selection/request`,
      { quotationId },
      authCfg()
    );
  };

  // const startPostBid = async (tender, { rangeMin, rangeMax } = {}) => {
  //   const tenderId = tender?._id;
  //   if (!tenderId) return;

  //   const st = String(tender?.postBid?.status || "").toLowerCase();
  //   if (st === "active") {
  //     toast.info("Post bid is already live for this tender.");
  //     return;
  //   }

  //   const min = Number(rangeMin);
  //   const max = Number(rangeMax);

  //   if (!Number.isFinite(min) || !Number.isFinite(max)) {
  //     toast.error("Please enter valid numbers for range.");
  //     return;
  //   }
  //   if (min > max) {
  //     toast.error("Range Min must be <= Range Max.");
  //     return;
  //   }

  //   try {
  //     setStartingPostBid((p) => ({ ...p, [tenderId]: true }));

  //     await axios.post(
  //       `${API.START_POST_BID}/${tenderId}/post-bid/start`,
  //       { durationMinutes: 10, rangeMin: min, rangeMax: max },
  //       authCfg()
  //     );

  //     toast.success("Post bid started (10 minutes). Transporters can now improve their quotes.");
  //     setPostBidDraftByTender((p) => ({ ...p, [tenderId]: { ...p[tenderId], open: false } }));

  //     if (fetchTenderHistory) await fetchTenderHistory();
  //   } catch (e) {
  //     toast.error(e?.response?.data?.message || "Could not start post bid.");
  //   } finally {
  //     setStartingPostBid((p) => ({ ...p, [tenderId]: false }));
  //   }
  // };

  const handleRequestConfirmation = async ({ tender, quotation }) => {

    const tenderId = tender?._id;
    const qid = quotation?._id;

    if (!tenderId || !qid) {
      toast.error("Tender/Quotation not found. Please refresh and try again.");
      return;
    }

    if (requestingConfirmByQ[qid]) return;

    try {
      setRequestingConfirmByQ((p) => ({ ...p, [qid]: true }));

      await requestTransporterConfirm(tender._id, quotation._id);

      toast.success("Request sent to transporter for confirmation.");
      if (fetchTenderHistory) await fetchTenderHistory();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not request confirmation.");
    } finally {
      setRequestingConfirmByQ((p) => ({ ...p, [qid]: false }));
    }
  };

  // only opens terms AFTER transporter confirmed
  const handleProceedToPay = ({ tender, quotation }) => {
    const finalPricePerMt = Number(quotation.price);
    // const totalWeightMt =
    //   toNumber(tender.totalWeight) ||
    //   (tender.materials || []).reduce((sum, m) => sum + toNumber(m.weight), 0);

    const totalWeightMt = toNumber(tender.totalWeight);

    if (!totalWeightMt) {
      toast.error("Total weight is missing for this tender.");
      return;
    }

    const PAY_PERCENT = Number(import.meta.env.VITE_FINALIZE_ADVANCE_PERCENT ?? 5);
    const DISPLAY_PERCENT = Number(import.meta.env.VITE_FINALIZE_ADVANCE_DISPLAY_PERCENT ?? PAY_PERCENT);

    const calcPay = calcAdvancePayment({
      pricePerMt: finalPricePerMt,
      totalWeightMt,
      percent: PAY_PERCENT,
    });

    const calcDisplay = calcAdvancePayment({
      pricePerMt: finalPricePerMt,
      totalWeightMt,
      percent: DISPLAY_PERCENT,
    });

    setTermsFinalize({
      tenderId: tender._id,
      quotationId: quotation._id,
      finalPricePerMt,
      totalWeightMt: calcPay.totalWeightMt,
      totalRupees: calcPay.totalRupees,

      // payable
      advancePercent: calcPay.percent,
      advanceRupees: calcPay.advanceRupees,
      advancePaise: calcPay.advancePaise,

      // display (promo strike-through)
      displayPercent: DISPLAY_PERCENT,
      displayAdvanceRupees: calcDisplay.advanceRupees,
    });
  };

  const proceedFinalizeAfterTerms = async ({
    tenderId,
    quotationId,
    finalPricePerMt,
    totalWeightMt,
    advanceRupees,
    totalRupees,
    advancePercent,
  }) => {
    setIsFinalizing(true);

    const token = localStorage.getItem("session_token");
    const authCfg = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    let handedToRazorpay = false;

    try {
      // 1) Create/Reuse order OR detect alreadyPaid
      const orderRes = await axios.post(
        `${API.FINALIZE_TENDER_CREATE_ORDER}/${tenderId}/finalize/payment/order`,
        { quotationId, finalPricePerMt, totalWeightMt, advancePercentNotice: advancePercent },
        authCfg
      );

      const { alreadyPaid, alreadyFinalized, keyId, orderId, amount, currency } = orderRes.data;

      // (optional) if backend returns alreadyFinalized
      if (alreadyFinalized) {
        toast.info("Tender already finalized.");
        setTermsFinalize(null);
        if (fetchTenderHistory) await fetchTenderHistory();
        return;
      }

      // 2) If payment already done -> ONLY finalize, no Razorpay popup
      if (alreadyPaid) {
        try {
          const finalizeRes = await axios.put(
            `${API.FINALIZE_TENDER}/${tenderId}`,
            { quotationId, finalPrice: finalPricePerMt },
            authCfg
          );

          // your email handling (keep same)
          const email = finalizeRes?.data?.email;
          if (email) {
            if (email.transporterEmailSent) toast.success("Email sent to transporter.");
            else toast.warn(`Tender finalized, but transporter email failed${email.transporterEmailError ? `: ${email.transporterEmailError}` : "."}`);

            if (email.rrEmailSent) toast.success("Email sent to you (with transporter contact).");
            else toast.warn(`Tender finalized, but RR email failed${email.rrEmailError ? `: ${email.rrEmailError}` : "."}`);
          }

          toast.success("Payment already received. Tender finalized!");
          setTermsFinalize(null);
          if (fetchTenderHistory) await fetchTenderHistory();
        } catch (e) {
          toast.error(e?.response?.data?.message || "Payment done, but finalization failed. Try finalize again.");
        }
        return;
      }

      // 3) Need payment -> load Razorpay only now
      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error("Razorpay SDK failed to load. Check internet.");
        return;
      }

      const options = {
        key: keyId,
        amount, // paise (advance only) from backend
        currency,
        name: "YuvaQ",
        description: `Advance Payment (${advancePercent}% of total) • ₹${Number(advanceRupees).toLocaleString()} (Total ₹${Number(totalRupees).toLocaleString()})`,
        order_id: orderId,

        handler: async function (response) {

          setIsFinalizing(true);

          try {
            // 4) Verify payment
            await axios.post(
              `${API.FINALIZE_TENDER_VERIFY_PAYMENT}/${tenderId}/finalize/payment/verify`,
              {
                quotationId,
                finalPricePerMt,
                totalWeightMt,
                advancePercent,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              authCfg
            );

            // 5) Finalize tender
            const finalizeRes = await axios.put(
              `${API.FINALIZE_TENDER}/${tenderId}`,
              { quotationId, finalPrice: finalPricePerMt },
              authCfg
            );

            const email = finalizeRes?.data?.email;
            if (email) {
              if (email.transporterEmailSent) toast.success("Email sent to transporter.");
              else toast.warn(`Tender finalized, but transporter email failed${email.transporterEmailError ? `: ${email.transporterEmailError}` : "."}`);

              if (email.rrEmailSent) toast.success("Email sent to you (with transporter contact).");
              else toast.warn(`Tender finalized, but RR email failed${email.rrEmailError ? `: ${email.rrEmailError}` : "."}`);
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

      handedToRazorpay = true;

      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not start payment.");
    } finally {
      if (!handedToRazorpay) setIsFinalizing(false);
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
      toast.error(e?.response?.data?.message || "Failed to reopen quotation");
    } finally {
      setReopenModalTenderId(null)
    }
  }

  const handleReopen = (tenderId) => {
    setReopenModalTenderId(tenderId)
  }

  const clearSearch = () => setSearchQuery("")
  const clearFilters = () => {
    setStatusFilter("all")
    setDateRange({ from: "", to: "" })
  }

  // 🔎 Apply search + filters to CURRENT PAGE results
  const filteredTenders = useMemo(() => {
    return tenderHistories.filter((t) => {
      // const matchSearch = [t.projectName, t.dispatchLocation, t.projectCode].some((val) =>
      //   (val || "").toLowerCase().includes(searchQuery.toLowerCase())
      // );

      const matchSearch = [
        t.projectName,
        t.projectCode,
        t.pickup?.address,
        t.pickup?.city,
        t.pickup?.district,
        t.pickup?.state,
        ...(Array.isArray(t.materials) ? t.materials.flatMap((m) => [m?.hsnCode, m?.materialName]) : []),
      ].some((val) => (val || "").toLowerCase().includes(searchQuery.toLowerCase()));

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

  // Fetch on demand if needed, then export (same behavior)
  const exportWithResponses = async (tender, kind /* 'pdf' | 'excel' */) => {
    const tenderId = tender._id;

    let responses = normalizeResponses(allResponses[tenderId]);

    if (!responses.length) {
      try {
        const res = await axios.get(
          `${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`,
          { withCredentials: true }
        );
        responses = normalizeResponses(res?.data?.data || res?.data);
      } catch (e) {
        toast.error("Could not load transporter responses for export.");
        responses = [];
      }
    }

    if (kind === "pdf") {
      exportTenderPDF(tender, responses, transporterList, true);
    } else {
      exportTenderExcel(tender, responses, transporterList, true);
    }
  };

  const submitDeleteTender = async (reason) => {
    const t = deleteTender;
    if (!t?._id) return;

    const r = String(reason || "").trim();
    if (!r) {
      toast.error("Reason is required.");
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError("");

      const token = localStorage.getItem("session_token");
      await axios.delete(`${API.DELETE_TENDER}/${t._id}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        data: { reason: r }, // ✅ DELETE body
        timeout: 15000,
      });

      toast.success("Tender cancelled successfully. Emails sent to transporters.");
      setDeleteTender(null);

      if (fetchTenderHistory) await fetchTenderHistory();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to delete tender.";
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
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
                {/* <ScopeChip
                  value="all"
                  label="All tenders"
                  desc="All tenders in the database"
                  activeClass="bg-gradient-to-r from-sky-500 to-blue-600"
                /> */}
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
              // const responses = allResponses[tenderId] || []
              const raw = allResponses[tenderId];
              const responses =
                Array.isArray(raw)
                  ? raw
                  : Array.isArray(raw?.data)
                    ? raw.data
                    : Array.isArray(raw?.combinedForUI)
                      ? raw.combinedForUI
                      : Array.isArray(raw?.normal)
                        ? raw.normal
                        : [];

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

                    canDelete={canDeleteTender(tender)}
                    onDeleteClick={(t) => setDeleteTender(t)}
                    deleteDisabledHint="Delete allowed only before bidding starts"
                  />


                  {openIdx === idx && (
                    <div className="border-t border-slate-200 p-5">
                      <TenderDetails tender={tender} getTransporterName={getTransporterName} />

                      {/* AUTO POST BID STATUS BAR */}
                      {(() => {
                        const postBidStatus = String(tender?.postBid?.status || "inactive").toLowerCase();

                        const biddingEndMs = tender?.biddingEnd
                          ? new Date(tender.biddingEnd).getTime()
                          : null;

                        const endsAt = tender?.postBid?.endsAt
                          ? new Date(tender.postBid.endsAt)
                          : null;

                        const rangeMin = tender?.postBid?.rangeMin;
                        const rangeMax = tender?.postBid?.rangeMax;
                        const baseL1Price = tender?.postBid?.baseL1Price;

                        const isBeforeBiddingEnd = biddingEndMs && nowMs < biddingEndMs;
                        const isAfterBiddingEnd = biddingEndMs && nowMs >= biddingEndMs;

                        const isActive = postBidStatus === "active";
                        const isEnded = postBidStatus === "ended";
                        const isInactive = !postBidStatus || postBidStatus === "inactive";

                        let title = "";
                        let description = "";
                        let badgeClass = "bg-slate-100 text-slate-600 border-slate-200";

                        if (isBeforeBiddingEnd) {
                          const left = biddingEndMs - nowMs;
                          const mm = Math.floor(left / 60000);
                          const ss = Math.floor((left % 60000) / 1000);

                          title = "Normal bidding is active";
                          description = `Auto post-bid will start after bidding ends. Time left: ${mm}:${String(ss).padStart(2, "0")}`;
                          badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                        } else if (isAfterBiddingEnd && isInactive) {
                          title = "Waiting for auto post-bid";
                          description = "Bidding has ended. Backend will calculate L1 and start post-bid automatically.";
                          badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
                        } else if (isActive) {
                          const remainingMs = endsAt ? endsAt.getTime() - nowMs : 0;
                          const safeRemaining = Math.max(0, remainingMs);
                          const mm = Math.floor(safeRemaining / 60000);
                          const ss = Math.floor((safeRemaining % 60000) / 1000);

                          title = "Post-bid is live";
                          description = `Transporters can submit improved quotes. Time left: ${mm}:${String(ss).padStart(2, "0")}`;
                          badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        } else if (isEnded) {
                          title = "Post-bid ended";
                          description = "Post-bid window has ended. You can proceed with selection/finalization.";
                          badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
                        } else {
                          title = "Post-bid status unavailable";
                          description = "Refresh tender history to check latest post-bid status.";
                        }

                        return (
                          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isAfterBiddingEnd && isInactive && (
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                  )}

                                  <h3 className="text-sm font-semibold text-slate-800">
                                    {title}
                                  </h3>

                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeClass}`}>
                                    {postBidStatus.toUpperCase()}
                                  </span>

                                  {tender?.postBid?.autoStarted && (
                                    <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                                      AUTO STARTED
                                    </span>
                                  )}
                                </div>

                                {/* <p className="mt-1 text-xs text-slate-600">
                                  {description}
                                </p> */}

                                <p className="mt-1 text-xs text-slate-600">
                                  {description.split("Time left:")[0]}
                                  {description.includes("Time left:") && (
                                    <span className="ml-1 font-bold text-base text-red-600 tracking-wide">
                                      Time left: {description.split("Time left:")[1]}
                                    </span>
                                  )}
                                </p>
                              </div>

                              {(rangeMin != null || rangeMax != null || baseL1Price != null) && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                  {baseL1Price != null && (
                                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                      <div className="text-slate-500">Base L1 Price</div>
                                      <div className="font-semibold text-slate-800">
                                        ₹{Number(baseL1Price).toLocaleString("en-IN")}
                                      </div>
                                    </div>
                                  )}

                                  {rangeMin != null && (
                                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                      <div className="text-slate-500">Post-bid Min</div>
                                      <div className="font-semibold text-emerald-700">
                                        ₹{Number(rangeMin).toLocaleString("en-IN")}
                                      </div>
                                    </div>
                                  )}

                                  {rangeMax != null && (
                                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                      <div className="text-slate-500">Post-bid Max</div>
                                      <div className="font-semibold text-emerald-700">
                                        ₹{Number(rangeMax).toLocaleString("en-IN")}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <TransporterResponses
                        responses={responses}
                        tender={tender}
                        selectedQuotationId={selectedQuotationId}
                        confirmedIdxMap={confirmedIdxMap}
                        editingId={editingId}
                        priceInput={priceInput}
                        setEditingId={setEditingId}
                        setPriceInput={setPriceInput}
                        // onConfirmFinal={handleDone}
                        onReopen={handleReopen}
                        getTransporterName={getTransporterName}
                        setPreviewFile={setPreviewFile}
                        responseError={responseErrors[tenderId]}
                        contact={contactByTender[tenderId]}
                        contactLoading={!!contactLoading[tenderId]}
                        onRevealContact={() => fetchFinalizedContact(tenderId)}
                        onRequestConfirmation={handleRequestConfirmation}
                        onProceedToPay={handleProceedToPay}
                        requestingConfirmByQ={requestingConfirmByQ}
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

      <DeleteTenderModal
        isOpen={!!deleteTender}
        tender={deleteTender}
        isLoading={deleteLoading}
        errorText={deleteError}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteError("");
            setDeleteTender(null);
          }
        }}
        onConfirm={submitDeleteTender}
      />
    </div>
  )
}

export default TenderHistoryAccordion
