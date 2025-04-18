import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Package,
  FileText,
  Truck,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  Briefcase,
} from "lucide-react";
import { ConfirmationModal } from "../../modals/ConfirmationModal";
import API from "../../API";
import TenderSearchFilter from "../TenderSearchFilter";

const TenderHistoryAccordion = ({
  tenderHistories = [],
  transporterList = [],
  fetchTenderHistory,
}) => {
  const [openIdx, setOpenIdx] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [confirmedIdxMap, setConfirmedIdxMap] = useState({});
  const [finalPricesMap, setFinalPricesMap] = useState({});
  const [allResponses, setAllResponses] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [isFinalizing, setIsFinalizing] = useState(false);

  const getTransporterName = (id) => {
    const found = transporterList.find((t) => t._id === id);
    return found ? found.name || found.email : id;
  };

  const toggleResponses = async (idx, tenderId) => {
    if (openIdx === idx) {
      setOpenIdx(null);
      return;
    }

    if (allResponses[tenderId]) {
      setOpenIdx(idx);
      return;
    }

    try {
      const response = await axios.get(
        `${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`,
        {
          withCredentials: true,
        }
      );

      // console.log("Transporter's quotation", response.data);

      setAllResponses((prev) => ({
        ...prev,
        [tenderId]: response.data.quotations,
      }));
      setOpenIdx(idx);
    } catch (error) {
      console.error("Failed to fetch responses:", error);
      toast.error("Could not load transporter responses. Please try again.");
    }
  };

  const handleConfirm = (tenderId, resIdx) => {
    const finalPrices = finalPricesMap[tenderId] || {};
    setEditingId(`${tenderId}-${resIdx}`);
    setPriceInput(finalPrices[resIdx] || "");
  };

  const handleDone = (tenderId, resIdx) => {
    setConfirmDialog({
      message: "Are you sure you want to finalize this quotation?",
      onConfirm: async () => {
        setIsFinalizing(true);

        const responsesForThisTender = (allResponses[tenderId] || [])
          .slice()
          .sort((a, b) => a.price - b.price);
        const quotation = responsesForThisTender[resIdx];
        const quotationId = quotation._id;
        const finalPrice = priceInput;

        try {
          await axios.put(
            `${API.FINALIZE_TENDER}/${tenderId}`,
            {
              quotationId,
              finalPrice: Number(finalPrice),
            },
            {
              withCredentials: true,
            }
          );

          setFinalPricesMap((prev) => ({
            ...prev,
            [tenderId]: {
              ...prev[tenderId],
              [resIdx]: finalPrice,
            },
          }));

          setConfirmedIdxMap((prev) => ({
            ...prev,
            [tenderId]: resIdx,
          }));

          setEditingId(null);
          toast.success("Tender finalized successfully!");

          // Refresh data from server
          if (fetchTenderHistory) await fetchTenderHistory();
        } catch (error) {
          console.error("Error finalizing tender:", error);
          toast.error(
            "Something went wrong while finalizing. Please try again."
          );
        } finally {
          setIsFinalizing(false);
          setConfirmDialog(null);
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDateRange({ from: "", to: "" });
  };

  // Filter tenders based on search query and filters
  const filteredTenders = tenderHistories.filter((tender) => {
    // Search by project name or location
    const searchMatch =
      (tender.projectName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (tender.dispatchLocation || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (tender.projectCode || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Filter by status
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "finalized" && tender.status === "finalized") ||
      (statusFilter === "Open" && tender.status !== "finalized");

    // Strict delivery window match
    let dateMatch = true;
    if (dateRange.from && dateRange.to) {
      const selectedFrom = new Date(dateRange.from);
      const selectedTo = new Date(dateRange.to);
      selectedTo.setHours(23, 59, 59, 999); // include the whole end day

      const deliveryFrom = tender.deliveryWindow?.from
        ? new Date(tender.deliveryWindow.from)
        : null;
      const deliveryTo = tender.deliveryWindow?.to
        ? new Date(tender.deliveryWindow.to)
        : null;

      if (deliveryFrom && deliveryTo) {
        dateMatch = deliveryFrom >= selectedFrom && deliveryTo <= selectedTo;
      } else {
        dateMatch = false; // if delivery window is missing, exclude it
      }
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
    return new Date(dateString).toLocaleString("en-US", options)
  }
  

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="h-6 w-6 text-emerald-600" />
        Tender History
      </h1>

      {/* Enhanced Search and Filter Section */}
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

      {/* Search Results Stats */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {filteredTenders.length === 0
            ? "No results found"
            : `Showing ${filteredTenders.length} of ${tenderHistories.length} tenders`}
        </p>
        {searchQuery && (
          <p className="text-sm text-slate-500">
            Search results for:{" "}
            <span className="font-medium text-emerald-600">{searchQuery}</span>
          </p>
        )}
      </div>

      {filteredTenders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-lg">No tender history available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTenders.map((tender, idx) => {
            const tenderId = tender._id;
            // const confirmedIdx = confirmedIdxMap[tenderId]
            // const finalPrices = finalPricesMap[tenderId] || []
            const responsesForThisTender = (allResponses[tenderId] || [])
              .slice()
              .sort((a, b) => a.price - b.price);

            const selectedQuotationId = tender.selectedQuotation?._id;
            const selectedFinalPrice =
              tender.finalPrice || tender.selectedQuotation?.price;

            return (
              <div
                key={tenderId}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200"
              >
                {/* Tender Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                  onClick={() => toggleResponses(idx, tenderId)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          Tender :{" "}
                          {tender.projectName
                            ? tender.projectName
                            : `Tender for ${tender.dispatchLocation || "Unknown Location"
                            }`}
                        </h3>

                        <p className="text-sm text-slate-500">
                          Created on {formatDate(tender.createdAt)} •{" "}
                          {tender.materials?.length || 0} materials
                          {tender.projectCode &&
                            ` • Project Code: ${tender.projectCode}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${tender.status === "finalized"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                          }`}
                      >
                        {tender.status || "PENDING"}
                      </span>
                      {openIdx === idx ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Tender Details - Visible when expanded */}
                {openIdx === idx && (
                  <div className="border-t border-slate-200 p-5">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Project Details */}
                        {(tender.projectName ||
                          tender.projectCode ||
                          tender.purchaseOrder) && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                                <Briefcase className="h-4 w-4 text-emerald-600" />{" "}
                                Project Details
                              </h4>
                              <div className="bg-slate-50 rounded-lg p-3">
                                <div className="grid grid-cols-2 gap-2">
                                  {tender.projectName && (
                                    <div>
                                      <span className="text-xs text-slate-500">
                                        Project Name:
                                      </span>
                                      <p className="font-medium text-slate-800">
                                        {tender.projectName}
                                      </p>
                                    </div>
                                  )}
                                  {tender.projectCode && (
                                    <div>
                                      <span className="text-xs text-slate-500">
                                        Project Code:
                                      </span>
                                      <p className="font-medium text-slate-800">
                                        {tender.projectCode}
                                      </p>
                                    </div>
                                  )}
                                  {tender.purchaseOrder && (
                                    <div>
                                      <span className="text-xs text-slate-500">
                                        Purchase Code:
                                      </span>
                                      <p className="font-medium text-slate-800">
                                        {tender.purchaseOrder}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {tender.projectRemark && (
                                  <div className="mt-2">
                                    <span className="text-xs text-slate-500">
                                      Project Remark:
                                    </span>
                                    <p className="text-slate-700 text-sm">
                                      {tender.projectRemark}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">
                            Delivery Window
                          </h4>
                          <p className="font-medium text-slate-800">
                            {tender.deliveryWindow?.from &&
                              tender.deliveryWindow?.to
                              ? `${formatDate(
                                tender.deliveryWindow.from
                              )} to ${formatDate(tender.deliveryWindow.to)}`
                              : "Not specified"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">
                            Closing Date
                          </h4>
                          <p className="font-medium text-slate-800">
                            {formatDate(tender.closeDate)}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">
                            Bidding Window
                          </h4>
                          <p className="font-medium text-slate-800">
                            {tender.biddingStart && tender.biddingEnd
                              ? `${formatDateTime(tender.biddingStart)} to ${formatDateTime(tender.biddingEnd)}`
                              : "Not specified"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">
                            Location Details
                          </h4>
                          <p className="text-slate-800">
                            {tender.dispatchLocation}
                            {tender.address ? `, ${tender.address}` : ""}
                            {tender.pincode ? ` - ${tender.pincode}` : ""}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">
                            Totals
                          </h4>
                          <div className="flex gap-4">
                            <span className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-md text-sm">
                              <span className="text-slate-600">Weight:</span>{" "}
                              <span className="font-medium text-emerald-700">
                                {tender.totalWeight || 0} kg
                              </span>
                            </span>
                            <span className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-md text-sm">
                              <span className="text-slate-600">Quantity:</span>{" "}
                              <span className="font-medium text-emerald-700">
                                {tender.totalQuantity || 0} pcs
                              </span>
                            </span>
                          </div>
                        </div>

                        {tender.remarks && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">
                              Remarks
                            </h4>
                            <p className="text-slate-800 bg-slate-50 p-2 rounded-md">
                              {tender.remarks}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Materials */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">
                            Materials
                          </h4>
                          {tender.materials?.length > 0 ? (
                            <div className="bg-slate-50 rounded-lg p-3">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-slate-600">
                                    <th className="px-2 py-1 text-left">
                                      Material
                                    </th>
                                    <th className="px-2 py-1 text-left">
                                      Sub Item
                                    </th>
                                    <th className="px-2 py-1 text-right">
                                      Weight
                                    </th>
                                    <th className="px-2 py-1 text-right">
                                      Quantity
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tender.materials.map((material, idx) => (
                                    <tr
                                      key={idx}
                                      className="border-t border-slate-200"
                                    >
                                      <td className="px-2 py-1.5 font-medium">
                                        {material.material}
                                      </td>
                                      <td className="px-2 py-1.5">
                                        {material.subMaterial || "-"}
                                      </td>
                                      <td className="px-2 py-1.5 text-right">
                                        {material.weight} kg
                                      </td>
                                      <td className="px-2 py-1.5 text-right">
                                        {material.quantity} pcs
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-slate-500 italic">
                              No materials added
                            </p>
                          )}
                        </div>

                        {/* Transporters */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">
                            Selected Transporters
                          </h4>
                          {tender.transporters?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {tender.transporters.map((transporterId) => (
                                <div
                                  key={transporterId}
                                  className="bg-slate-100 px-3 py-1 rounded-md text-sm flex items-center gap-1.5"
                                >
                                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                                  {getTransporterName(transporterId)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 italic">
                              No transporters selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Responses Section */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-emerald-600" />
                        Transporter Responses
                      </h4>

                      {responsesForThisTender.length > 0 ? (
                        <div className="space-y-4">
                          {responsesForThisTender.map((res, rIdx) => {
                            // const uniqueKey = `${tenderId}-${rIdx}`
                            // const isEditing = editingId === uniqueKey
                            // // const isDimmed = confirmedIdx !== undefined && confirmedIdx !== rIdx
                            // const isDimmed = tender.status === "finalized" && confirmedIdx !== undefined && confirmedIdx !== rIdx

                            // const isSelected = res._id === selectedQuotationId
                            const isSelected =
                              res._id?.toString() ===
                              selectedQuotationId?.toString();
                            const isDimmed =
                              tender.status === "finalized" && !isSelected;
                            const isEditing =
                              editingId === `${tenderId}-${rIdx}`;

                            return (
                              <div
                                key={rIdx}
                                className={`border-l-4 p-5 rounded-lg shadow-sm transition duration-300 ${isDimmed
                                    ? "border-slate-300 bg-slate-100 opacity-60"
                                    : "border-emerald-500 bg-white"
                                  }`}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-500">
                                      Transporter
                                    </p>
                                    <p className="text-lg font-semibold text-slate-800">
                                      {getTransporterName(res.transportUser)}

                                      {isSelected &&
                                        tender.status === "finalized" && (
                                          <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            Finalized
                                          </span>
                                        )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-500">
                                      Price
                                    </p>
                                    <p className="text-lg font-semibold text-green-700">
                                      ₹{res.price}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-500">
                                      Vehicle Detail
                                    </p>
                                    <p className="text-md font-medium text-slate-700">
                                      {res.vehicleNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-500">
                                      Attachments
                                    </p>
                                    <div className="text-sm text-slate-700 space-y-1">
                                      {res?.files?.length > 0 ? (
                                        res.files.map((file, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() =>
                                              setPreviewFile({
                                                url: file.url || file,
                                                mimetype: file.mimetype || "",
                                                originalName:
                                                  file.originalName ||
                                                  `Attachment ${idx + 1}`,
                                              })
                                            }
                                            className="text-emerald-600 hover:underline text-left flex items-center gap-1"
                                          >
                                            <FileText className="h-3.5 w-3.5" />
                                            {file.originalName ||
                                              `Attachment ${idx + 1}`}
                                          </button>
                                        ))
                                      ) : (
                                        <p>No attachments</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  {isSelected &&
                                    tender.status === "finalized" ? (
                                    <div className="text-green-700 font-semibold text-md bg-green-50 p-3 rounded-md border border-green-200 flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4" />
                                      Final Deal Price: ₹{selectedFinalPrice}
                                    </div>
                                  ) : tender.status !== "finalized" &&
                                    isEditing ? (
                                    <div className="mt-3 flex gap-3 items-center">
                                      <input
                                        type="number"
                                        value={priceInput}
                                        onChange={(e) =>
                                          setPriceInput(e.target.value)
                                        }
                                        className="border border-slate-300 px-3 py-2 rounded-md w-40 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        placeholder="Final Price"
                                      />
                                      <button
                                        onClick={() =>
                                          handleDone(tenderId, rIdx)
                                        }
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
                                      >
                                        Confirm
                                      </button>
                                    </div>
                                  ) : (
                                    tender.status !== "finalized" &&
                                    confirmedIdxMap[tenderId] === undefined && (
                                      <div className="mt-3 space-y-2">
                                        <p className="text-sm text-amber-600 flex items-center gap-1">
                                          <AlertCircle className="h-4 w-4" />
                                          Please enter the final price after
                                          negotiation before confirming.
                                        </p>
                                        <button
                                          onClick={() =>
                                            handleConfirm(tenderId, rIdx)
                                          }
                                          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
                                        >
                                          Set Final Price
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                          <Truck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500">
                            No responses received yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-3 right-3 text-slate-500 hover:text-red-500 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4 pr-8">
              {previewFile.originalName}
            </h3>

            {previewFile.mimetype.startsWith("image/") ? (
              <img
                src={previewFile.url || "/placeholder.svg"}
                alt={previewFile.originalName}
                className="w-full max-h-[70vh] object-contain rounded-md"
              />
            ) : previewFile.mimetype === "application/pdf" ? (
              <iframe
                src={previewFile.url}
                className="w-full h-[70vh] rounded-md"
                title="PDF Preview"
              />
            ) : (
              <div className="bg-slate-50 p-8 rounded-md text-center">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">
                  Preview not supported for this file type.
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <a
                href={previewFile.url}
                download={previewFile.originalName}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
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
