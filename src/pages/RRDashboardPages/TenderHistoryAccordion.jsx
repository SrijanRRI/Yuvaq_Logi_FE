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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Tender History
          </h1>
          <p className="mt-1 opacity-80">View and manage your past tenders</p>
        </div>

        <div className="p-6">
          {/* Search and Filter */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className={`w-full pl-10 pr-12 py-3 border ${searchFocused ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-300"} rounded-xl focus:outline-none transition-all duration-200`}
                placeholder="Search by project name, location or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {searchQuery && (
                  <button onClick={clearSearch} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`ml-1 p-1.5 ${filterOpen || statusFilter !== "all" || (dateRange.from && dateRange.to) ? "bg-indigo-100 text-indigo-600" : "hover:bg-slate-100 text-slate-400"} rounded-full transition-colors`}
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>

            {filterOpen && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-slate-700">Filter Tenders</h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="finalized">Finalized</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4 text-sm text-slate-500 flex items-center gap-2">
            {filteredTenders.length === 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                No results found
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md"
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
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
                <div className="bg-white rounded-full p-4 inline-flex mb-3 shadow-sm">
                  <Search className="h-10 w-10 text-slate-300" />
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
