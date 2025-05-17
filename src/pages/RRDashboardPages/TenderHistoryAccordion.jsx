"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { Clock, Search, Filter, X, Calendar, CheckCircle2 } from "lucide-react"
import API from "../../API"

import { ConfirmationModal } from "../../modals/ConfirmationModal"
import TenderCard from "./TenderCard"
import TransporterResponses from "./TransporterResponses"
import TenderDetails from "./TenderDetails"
import AttachmentPreviewModal from "../../modals/AttachmentPreviewModal"
import ReopenConfirmationModal from "../../modals/ReopenConfirmationModal"

const TenderHistoryAccordion = ({ tenderHistories = [], transporterList = [], fetchTenderHistory }) => {
  const [openIdx, setOpenIdx] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [priceInput, setPriceInput] = useState("")
  const [confirmedIdxMap, setConfirmedIdxMap] = useState({})
  const [allResponses, setAllResponses] = useState({})
  const [previewFile, setPreviewFile] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [reopenModalTenderId, setReopenModalTenderId] = useState(null)

  const [fetchedResponseIds, setFetchedResponseIds] = useState(new Set())
  const [responseErrors, setResponseErrors] = useState({})

  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [isFinalizing, setIsFinalizing] = useState(false)

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

  const handleDone = async (tenderId, idx, directPrice = null) => {
    const responses = allResponses[tenderId] || []
    const sorted = responses.slice().sort((a, b) => a.price - b.price)
    const quotation = sorted[idx]

    const finalPrice =
      directPrice !== null ? directPrice : priceInput.trim() !== "" ? Number(priceInput) : quotation.price

    setConfirmDialog({
      message: `Are you sure you want to finalize this quotation at price ₹${finalPrice}?`,
      onConfirm: async () => {
        setIsFinalizing(true)
        try {
          await axios.put(
            `${API.FINALIZE_TENDER}/${tenderId}`,
            { quotationId: quotation._id, finalPrice },
            { withCredentials: true },
          )
          setConfirmedIdxMap((prev) => ({ ...prev, [tenderId]: idx }))
          toast.success("Tender finalized successfully")
          if (fetchTenderHistory) await fetchTenderHistory()
        } catch (err) {
          toast.error("Finalization failed")
        } finally {
          setConfirmDialog(null)
          setIsFinalizing(false)
          setPriceInput("") // Clear input after done
        }
      },
      onCancel: () => setConfirmDialog(null),
    })
  }

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

  const filteredTenders = tenderHistories.filter((t) => {
    const matchSearch = [t.projectName, t.dispatchLocation, t.projectCode].some((val) =>
      (val || "").toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const matchStatus = statusFilter === "all" || t.status.toLowerCase() === statusFilter.toLowerCase()

    let matchDate = true
    if (dateRange.from && dateRange.to && t.deliveryWindow?.from && t.deliveryWindow?.to) {
      const from = new Date(dateRange.from)
      const to = new Date(dateRange.to)
      const dwFrom = new Date(t.deliveryWindow.from)
      const dwTo = new Date(t.deliveryWindow.to)
      to.setHours(23, 59, 59, 999)
      matchDate = dwFrom >= from && dwTo <= to
    }

    return matchSearch && matchStatus && matchDate
  })

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
                className={`w-full pl-12 pr-12 py-4 border-2 ${
                  searchFocused ? "border-emerald-500 ring-4 ring-emerald-100" : "border-slate-200 hover:border-slate-300"
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
                  className={`ml-1 p-2.5 rounded-full transition-all duration-300 ${
                    filterOpen || statusFilter !== "all" || (dateRange.from && dateRange.to)
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
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                            statusFilter === status.value
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
                    className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      statusFilter === "finalized"
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
          </div>

          <div className="mb-4 text-sm flex items-center gap-2">
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
          </div>

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

            {filteredTenders.length === 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50 border border-slate-200 rounded-xl p-10 text-center">
                <div className="bg-white rounded-full p-4 inline-flex mb-3 shadow-sm">
                  <Search className="h-10 w-10 text-emerald-200" />
                </div>
                <p className="text-slate-700 font-medium mb-2">No tenders found</p>
                <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewFile && <AttachmentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      {reopenModalTenderId && (
        <ReopenConfirmationModal onConfirm={handleReopenSubmit} onCancel={() => setReopenModalTenderId(null)} />
      )}

      {confirmDialog && (
        <ConfirmationModal
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          isLoading={isFinalizing}
        />
      )}
    </div>
  )
}

export default TenderHistoryAccordion
