import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  History,
  ClipboardList,
  FilePlus2,
  RotateCcw,
  Calendar,
} from "lucide-react";

import API from "../API";
import Navbar from "../components/Navbar";
import { logout } from "../utils/UserSlice";

import TenderForm from "./RRDashboardPages/TenderForm";
import TenderHistoryAccordion from "./RRDashboardPages/TenderHistoryAccordion";
import { MaterialModal } from "../modals/MaterialModal";
import TransporterModal from "../modals/TransporterModal";
import ShipmentDetailsTab from "./RRDashboardPages/ShipmentDetailsTab";
import ShipmentPlannedTab from "./RRDashboardPages/ShipmentPlannedTab";

const initialFormState = {
  deliveryWindow: { from: "", to: "" },
  closingDate: "",
  biddingStart: "",
  biddingEnd: "",
  dispatchLocation: "",
  address: "",
  pincode: "",
  projectName: "",
  projectCode: "",
  purchaseOrder: "",
  projectRemark: "",
  materials: [],
  weight: "",
  quantity: "",
  remarks: "",
  transporter: [],
  isManualTotals: false,
  maxBidAmount: "",
  maxBidUnit: "",
  priceDifference: "",
};

const RRDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.User?.userInfo);
  const userName = userInfo?.name || "RR User";
  const userId = userInfo?._id;

  const [historyScope, setHistoryScope] = useState("mine");

  const [activeTab, setActiveTab] = useState("create");
  const [viewHistory, setViewHistory] = useState(false);

  // history bits
  const [tenderHistories, setTenderHistories] = useState([]);
  const [transporterList, setTransporterList] = useState([]);

  // pagination state for history
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyMeta, setHistoryMeta] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchTenderHistory = async (page = historyPage, limit = historyLimit, scope = historyScope) => {
    try {
      // Build URL: include userId only when scope === 'mine'
      const qUser = scope === "mine" && userId ? `&userId=${encodeURIComponent(userId)}` : "";
      const url = `${API.FETCH_ALL_TENDER_CREATED_BY_RRUSER}?page=${page}&limit=${limit}${qUser}`;

      const response = await axios.get(url, { withCredentials: true });
      const data = response?.data?.data || response?.data?.results || [];

      console.log("transporters detail" , data);

      const meta =
        response?.data?.pagination ||
        response?.data?.meta || {
          page: response?.data?.page ?? page,
          limit: response?.data?.limit ?? limit,
          totalPages: response?.data?.totalPages ??
            Math.max(1, Math.ceil((response?.data?.total || response?.data?.totalCount || data.length) / (limit || 1))),
          totalCount: response?.data?.totalCount ?? response?.data?.total ?? data.length,
        };

      setTenderHistories(data);
      setHistoryMeta({
        page: Number(meta.page) || page,
        limit: Number(meta.limit) || limit,
        totalPages: Number(meta.totalPages) || 1,
        totalCount: Number(meta.totalCount) || data.length,
      });
    } catch (err) {
      console.error("Failed to fetch tender history", err);
      toast.error("Could not fetch tender history. Please try again later.");
    }
  };

  const fetchTransporters = async () => {
    try {
      const res = await axios.get(API.FETCH_ALL_TRANSPORTER, {
        withCredentials: true,
      });
      setTransporterList(res.data?.data || []);
    } catch (e) {
      console.error("Failed to fetch transporters", e);
    }
  };

  useEffect(() => {
    if (viewHistory) {
      // include scope dependency so switching “mine/all” refetches
      fetchTenderHistory(historyPage, historyLimit, historyScope);
      fetchTransporters();
    }
  }, [viewHistory, historyPage, historyLimit, historyScope]);

  const handleHistoryScopeChange = (scope) => {
    setHistoryScope(scope);
    setHistoryPage(1); // reset pagination
  };

  // --- Create Tender form state ---
  const [form, setForm] = useState(initialFormState);
  const [selectedTransporters, setSelectedTransporters] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTransporterModal, setShowTransporterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
  const [prefilledFromShipment, setPrefilledFromShipment] = useState(false);

  const [sourceShipmentId, setSourceShipmentId] = useState(null);
  // const [shipmentsRefreshSignal, setShipmentsRefreshSignal] = useState(0);

  // handlers
  const handleChange = (e) => {
    const { name, value, options } = e.target;

    if (name === "transporter") {
      const selected = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
      setForm((p) => ({ ...p, transporter: selected }));
    } else if (name === "maxBidAmount") {
      const rounded = value ? parseInt(value, 10) : "";
      setForm((p) => ({ ...p, maxBidAmount: rounded.toString() }));
    } else if (name === "priceDifference") {
      // accept only non-negative integers
      const v = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);
      setForm((p) => ({ ...p, priceDifference: v === "" ? "" : String(v) }));
    } else if (name === "weight" || name === "quantity") {
      setForm((p) => ({ ...p, [name]: value, isManualTotals: true }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleRemoveMaterial = (indexToRemove) => {
    setForm((prev) => {
      const updatedMaterials = prev.materials.filter(
        (_, i) => i !== indexToRemove
      );
      let weight = prev.weight;
      let quantity = prev.quantity;
      if (!prev.isManualTotals) {
        weight = updatedMaterials
          .reduce((a, m) => a + Number(m.weight || 0), 0)
          .toFixed(2);
        quantity = updatedMaterials.reduce(
          (a, m) => a + Number(m.quantity || 0),
          0
        );
      }
      return { ...prev, materials: updatedMaterials, weight, quantity };
    });
  };

  const handleTransporterSave = (selectedIds) => {
    setForm((p) => ({ ...p, transporter: selectedIds }));
    const objs = transporterList.filter((t) => selectedIds.includes(t._id));
    setSelectedTransporters(objs);
  };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setFormDisabled(true);

    const { from, to } = form.deliveryWindow;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const closing = new Date(form.closingDate);
    const bidStart = new Date(form.biddingStart);
    const bidEnd = new Date(form.biddingEnd);

    if (fromDate > toDate) {
      toast.error("Delivery 'From' date must be before 'To' date.");
      setLoading(false);
      setFormDisabled(false);
      return;
    }
    if (closing < fromDate || closing > toDate) {
      toast.error("Closing Date must be within the Delivery Window.");
      setLoading(false);
      setFormDisabled(false);
      return;
    }
    if (bidStart < fromDate || bidStart > toDate) {
      toast.error("Bidding Start must be within the Delivery Window.");
      setLoading(false);
      setFormDisabled(false);
      return;
    }
    if (bidEnd < fromDate || bidEnd > toDate) {
      toast.error("Bidding End must be within the Delivery Window.");
      setLoading(false);
      setFormDisabled(false);
      return;
    }
    if (bidStart > bidEnd) {
      toast.error("Bidding Start cannot be after Bidding End.");
      setLoading(false);
      setFormDisabled(false);
      return;
    }
    if (form.materials.length > 0 && (!form.weight || !form.quantity)) {
      toast.warning("Please enter total weight and quantity.");
      setLoading(false);
      setFormDisabled(false);
      return;
    }

    // OPTIONAL validation: priceDifference present and non-negative integer
    if (form.priceDifference !== "" && Number.isNaN(parseInt(form.priceDifference, 10))) {
      toast.error("Price Difference must be a number (₹).");
      setLoading(false);
      setFormDisabled(false);
      return;
    }

    const payload = {
      ...(sourceShipmentId && { shipmentPlanId: sourceShipmentId }),
      deliveryWindow: {
        from: form.deliveryWindow.from,
        to: form.deliveryWindow.to,
      },
      closeDate: form.closingDate,
      biddingStart: form.biddingStart,
      biddingEnd: form.biddingEnd,
      dispatchLocation: form.dispatchLocation,
      address: form.address,
      pincode: form.pincode,
      projectName: form.projectName,
      projectCode: form.projectCode,
      purchaseOrder: form.purchaseOrder,
      projectRemark: form.projectRemark,
      totalWeight: form.weight ? Number.parseFloat(form.weight) : null,
      totalQuantity: form.quantity ? Number.parseInt(form.quantity) : null,
      remarks: form.remarks,
      transporters: form.transporter,
      maxBidAmount: form.maxBidAmount ? parseInt(form.maxBidAmount, 10) : null,
      maxBidUnit: form.maxBidUnit || null,
      priceDifference: form.priceDifference === "" ? null : parseInt(form.priceDifference, 10),
      materials: form.materials.map((m) => ({
        material: m.item,
        subMaterial: m.subItem || null,
        weight: Number.parseFloat(m.weight),
        quantity: Number.parseInt(m.quantity),
      })),
    };

    try {
      const createRes = await axios.post(`${API.CREATE_TENDER}`, payload, {
        withCredentials: true,
      });

      // backend shape is { success: true, data: tender }
      const createdTender = createRes?.data?.data || createRes?.data;
      const tenderId = createdTender?._id;

      if (!tenderId) {
        console.warn("No tender _id returned from create API:", createRes?.data);
        toast.warn("Tender created, but ID missing in response.");
      }

      // keep your history list consistent with the backend shape
      if (createdTender) setTenderHistories((prev) => [createdTender, ...prev]);

      // setTenderHistories((prev) => [response.data, ...prev]);
      toast.success("Tender submitted successfully!");

      // NEW: if this tender was created from a shipment, mark that shipment as 'planned'
      if (sourceShipmentId) {
        try {
          await axios.put(
            `${API.SHIPMENT_DETAILS}/${sourceShipmentId}`,
            { status: "planned" },
            { withCredentials: true }
          );

          toast.success("Shipment marked as planned.");
          // // tell the Shipments tab to refresh next time we view it
          // setShipmentsRefreshSignal((n) => n + 1);
        } catch (markErr) {
          console.error("Failed to update shipment status:", markErr);
          toast.warn("Tender created, but failed to mark shipment as planned.");
        }
      }

      // 3) Notify users on WhatsApp using the tender ID
      if (tenderId) {
        try {
          await axios.post(
            `${API.WHATSAPP_NOTIFICATION}/${tenderId}/notify`,
            {},
            { withCredentials: true }
          );

          toast.success("WhatsApp notifications sent.");

        } catch (notifyErr) {
          console.error("Failed to send WhatsApp notifications:", notifyErr);
          toast.warn("Tender created, but failed to send WhatsApp notifications.");
        }
      }

      // Reset form
      setForm(initialFormState);
      setSelectedTransporters([]);
      setPrefilledFromShipment(false);
      setSourceShipmentId(null);

    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
      setFormDisabled(false);
    }
  };

  // ONLY map shipment fields you said will arrive
  const handlePrefillFromShipment = (shipment) => {
    setForm((prev) => ({
      ...prev,
      projectName: shipment.projectName || "",
      projectCode: shipment.projectCode || "",
      purchaseOrder: shipment.purchaseOrder || "",
      projectRemark: shipment.projectRemark || "",
      dispatchLocation: shipment.dispatchLocation || "",
      address: shipment.address || "",
      pincode: shipment.pincode || "",
      deliveryWindow: { from: "", to: "" },
      closingDate: "",
      biddingStart: "",
      biddingEnd: "",
      materials: [],
      weight: "",
      quantity: "",
      remarks: "",
      transporter: [],
      isManualTotals: false,
      maxBidAmount: "",
      maxBidUnit: "",
    }));

    // NEW: remember which shipment we’re creating a tender from
    setSourceShipmentId(shipment?._id ?? null);

    setPrefilledFromShipment(true);
    setActiveTab("create");
    setTimeout(() => {
      const el = document.getElementById("create-tender-anchor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const clearForm = () => {
    setForm(initialFormState);
    setSelectedTransporters([]);
    setPrefilledFromShipment(false);
    toast.info("Form cleared");
  };

  const historyButton = (
    <button
      onClick={() => setViewHistory(!viewHistory)}
      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
    >
      {viewHistory ? (
        <>
          <ArrowLeft className="h-4 w-4" /> Back
        </>
      ) : (
        <>
          <History className="h-4 w-4" /> View History
        </>
      )}
    </button>
  );

  const onLogout = async () => {
    try {
      await axios.post(API.LOGOUT_USER, {}, { withCredentials: true });
      dispatch(logout());
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
    } finally {
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar
        title="Dashboard"
        userName={userName}
        actions={[historyButton]}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {viewHistory ? (
          <TenderHistoryAccordion
            tenderHistories={tenderHistories}
            transporterList={transporterList}
            fetchTenderHistory={fetchTenderHistory}
            page={historyMeta.page}
            limit={historyMeta.limit}
            totalPages={historyMeta.totalPages}
            totalCount={historyMeta.totalCount}
            onPageChange={(p) => setHistoryPage(p)}
            onLimitChange={(l) => {
              setHistoryLimit(l);
              setHistoryPage(1); // reset to first page when page size changes
            }}
            loading={historyLoading}
            scope={historyScope}
            onScopeChange={handleHistoryScopeChange}
            currentUserName={userName}
          />
        ) : (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-6">
              <div className="flex">
                {/* <button
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "shipment"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-50"
                    }`}
                  onClick={() => setActiveTab("shipment")}
                 >
                  <ClipboardList className="h-4 w-4" /> Shipment Details
                </button> */}

                <button
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "create"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-50"
                    }`}
                  onClick={() => setActiveTab("create")}
                >
                  <FilePlus2 className="h-4 w-4" /> Create Tender
                </button>

                {/* NEW tab */}
                {/* <button
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "planned"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-50"
                    }`}
                  onClick={() => setActiveTab("planned")}
                 >
                  <Calendar className="h-4 w-4" /> Shipment Planned
                </button> */}
              </div>
            </div>

            {/* Content */}
            {activeTab === "shipment" ? (
              <ShipmentDetailsTab
                isActive={activeTab === "shipment"}
                onCreateFromShipment={handlePrefillFromShipment}
              />
            ) : activeTab === "create" ? (
              <div id="create-tender-anchor" className="scroll-mt-16 space-y-4">
                {/* Prefill banner + Clear button */}
                {(prefilledFromShipment || true) && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-emerald-800">
                      {prefilledFromShipment
                        ? "Form prefilled from Shipment Details. You can edit fields or clear the form to start fresh."
                        : "You can start a fresh tender or clear the form anytime."}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={clearForm}
                        type="button"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white"
                        title="Clear all form fields"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Clear Form
                      </button>
                    </div>
                  </div>
                )}

                <TenderForm
                  form={form}
                  setForm={setForm}
                  handleChange={handleChange}
                  handleSend={handleSend}
                  setShowMaterialModal={setShowMaterialModal}
                  setShowTransporterModal={setShowTransporterModal}
                  handleRemoveMaterial={handleRemoveMaterial}
                  selectedTransporters={selectedTransporters}
                  loading={loading}
                  formDisabled={formDisabled}
                />
              </div>
            ) : (
              // NEW content render
              <ShipmentPlannedTab
                onCreateFromShipment={handlePrefillFromShipment}
              />
            )}
          </>
        )}
      </div>

      {/* modals */}
      {showMaterialModal && (
        <MaterialModal
          close={() => setShowMaterialModal(false)}
          onAdd={(newMaterial) => {
            setForm((prev) => {
              const materials = [...prev.materials, newMaterial];
              let weight = prev.weight;
              let quantity = prev.quantity;
              if (!prev.isManualTotals) {
                weight = materials
                  .reduce((sum, m) => sum + Number.parseFloat(m.weight || 0), 0)
                  .toFixed(2);
                quantity = materials.reduce(
                  (sum, m) => sum + Number.parseInt(m.quantity || 0),
                  0
                );
              }
              return { ...prev, materials, weight, quantity };
            });
          }}
        />
      )}

      {showTransporterModal && (
        <TransporterModal
          selected={form.transporter}
          onClose={() => setShowTransporterModal(false)}
          onSave={handleTransporterSave}
          setTransporterList={setTransporterList}
        />
      )}
    </div>
  );
};

export default RRDashboardPage;
