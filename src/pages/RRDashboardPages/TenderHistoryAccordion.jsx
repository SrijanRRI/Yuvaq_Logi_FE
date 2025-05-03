import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Clock } from "lucide-react";
import API from "../../API";
import TenderSearchFilter from "./TenderSearchFilter";

import { ConfirmationModal } from "../../modals/ConfirmationModal";
import TenderCard from "./TenderCard";
import TransporterResponses from "./TransporterResponses";
import TenderDetails from "./TenderDetails";
import AttachmentPreviewModal from "../../modals/AttachmentPreviewModal";
import ReopenConfirmationModal from "../../modals/ReopenConfirmationModal";

const TenderHistoryAccordion = ({
  tenderHistories = [],
  transporterList = [],
  fetchTenderHistory,
}) => {
  const [openIdx, setOpenIdx] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [confirmedIdxMap, setConfirmedIdxMap] = useState({});
  const [allResponses, setAllResponses] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const [fetchedResponseIds, setFetchedResponseIds] = useState(new Set());
  const [responseErrors, setResponseErrors] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [isFinalizing, setIsFinalizing] = useState(false);

  const getTransporterName = (transporter) => {
    if (!transporter) return "Unknown";
    if (typeof transporter === "object") {
      return transporter.name || transporter.email || transporter._id;
    }
    const found = transporterList.find((t) => t._id === transporter);
    return found ? found.name || found.email : transporter;
  };

  const toggleResponses = (idx, tenderId) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));

    if (fetchedResponseIds.has(tenderId) || responseErrors[tenderId]) return;

    axios
      .get(`${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setAllResponses((prev) => ({ ...prev, [tenderId]: res.data.data }));
        setFetchedResponseIds((prev) => new Set(prev).add(tenderId));
      })
      .catch((err) => {
        const errorMessage =
          err?.response?.data?.err ||
          err?.response?.data?.message ||
          "Could not load transporter responses.";

        setResponseErrors((prev) => ({ ...prev, [tenderId]: errorMessage }));
        // toast.error(`Transporter response error: ${errorMessage}`);
      });
  };

  const handleDone = async (tenderId, idx, directPrice = null) => {
    const responses = allResponses[tenderId] || [];
    const sorted = responses.slice().sort((a, b) => a.price - b.price);
    const quotation = sorted[idx];
  
    const finalPrice = directPrice !== null
      ? directPrice
      : priceInput.trim() !== "" ? Number(priceInput) : quotation.price;
  
    setConfirmDialog({
      message: `Are you sure you want to finalize this quotation at price ₹${finalPrice}?`,
      onConfirm: async () => {
        setIsFinalizing(true);
        try {
          await axios.put(
            `${API.FINALIZE_TENDER}/${tenderId}`,
            { quotationId: quotation._id, finalPrice },
            { withCredentials: true }
          );
          setConfirmedIdxMap((prev) => ({ ...prev, [tenderId]: idx }));
          toast.success("Tender finalized successfully");
          if (fetchTenderHistory) await fetchTenderHistory();
        } catch (err) {
          toast.error("Finalization failed");
        } finally {
          setConfirmDialog(null);
          setIsFinalizing(false);
          setPriceInput(""); // Clear input after done
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };
  
  const handleReopen = (tenderId) => {
    setConfirmDialog({
      message: (
        <ReopenConfirmationModal
          onConfirm={async (reason) => {
            if (!reason.trim()) {
              toast.error("Please provide a reason to reopen the quotation.");
              return;
            }
            try {
              const api = await axios.post(`${API.REOPEN_QUOTATION}/${tenderId}`, { reason }, { withCredentials: true });
              // console.log("reopen quotation" , api.data);
              toast.success("Quotation reopened successfully");

              setConfirmedIdxMap((prev) => {
                const copy = { ...prev };
                delete copy[tenderId];
                return copy;
              });

              setPriceInput("");
              if (fetchTenderHistory) await fetchTenderHistory();

              setFetchedResponseIds((prev) => {
                const updated = new Set(prev);
                updated.delete(tenderId);
                return updated;
              });

            } catch {
              toast.error("Failed to reopen quotation");
            } finally {
              setConfirmDialog(null);
            }
          }}
          onCancel={() => setConfirmDialog(null)} 
        />
      ),
      onConfirm: () => { },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const formatDateTime = (date) => new Date(date).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const clearSearch = () => setSearchQuery("");
  const clearFilters = () => {
    setStatusFilter("all");
    setDateRange({ from: "", to: "" });
  };

  const filteredTenders = tenderHistories.filter((t) => {
    const matchSearch = [t.projectName, t.dispatchLocation, t.projectCode].some((val) =>
      (val || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "finalized" && t.status === "finalized") ||
      (statusFilter === "Open" && t.status !== "finalized");

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="h-6 w-6 text-emerald-600" /> Tender History
      </h1>

      <TenderSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        clearSearch={clearSearch}
        clearFilters={clearFilters}
      />

      <div className="mb-4 text-sm text-slate-500">
        {filteredTenders.length === 0 ? "No results found" : `Showing ${filteredTenders.length} of ${tenderHistories.length} tenders`}
      </div>

      {filteredTenders.map((tender, idx) => {
        const tenderId = tender._id;
        const selectedQuotationId = tender.selectedQuotation?._id;
        const responses = allResponses[tenderId] || [];

        return (
          <div key={tenderId} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <TenderCard
              tender={tender}
              open={openIdx === idx}
              onToggle={() => toggleResponses(idx, tenderId)}
              formatDate={formatDate}
            />
            {openIdx === idx && (
              <div className="border-t border-slate-200 p-5">
                <TenderDetails
                  tender={tender}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                  getTransporterName={getTransporterName}
                />

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
        );
      })}

      {previewFile && <AttachmentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      {confirmDialog && (
        <ConfirmationModal
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          isLoading={isFinalizing}
        />
      )}
    </div>
  );
};

export default TenderHistoryAccordion;