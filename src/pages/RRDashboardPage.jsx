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
// import { MaterialModal } from "../modals/MaterialModal";
import TransporterModal from "../modals/TransporterModal";
import ShipmentDetailsTab from "./RRDashboardPages/ShipmentDetailsTab";
import ShipmentPlannedTab from "./RRDashboardPages/ShipmentPlannedTab";
import DraftTendersPanel from "./RRDashboardPages/DraftTendersPanel";

const blankLocation = {
  pincode: "",
  state: "",
  address: "", // keep same meaning as your old "Address (City/District)"
  location: "",
  city: "",
  district: "",
  country: "India",
};

const initialFormState = {
  deliveryWindow: { from: "", to: "" },
  closingDate: "",
  biddingStart: "",
  biddingEnd: "",          //  Soft End (as per UI)
  biddingHardEnd: "",     //  NEW Hard Stop (Final Stop)
  pickup: { ...blankLocation },
  drop: { ...blankLocation },
  projectName: "",
  projectCode: "",
  purchaseOrder: "",
  projectRemark: "",
  materials: [],
  vehicleRequirements: [],
  weight: "",
  quantity: "",
  remarks: "",
  transporter: [],
  isManualTotals: false,
  minBidAmount: "",
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
  const [screen, setScreen] = useState("home");
  const [editingDraft, setEditingDraft] = useState(null);

  const toDateInputLocal = (d) => {
    if (!d) return "";
    const x = new Date(d);
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); // shift to local
    return x.toISOString().slice(0, 10); // yyyy-mm-dd
  };

  const toDateTimeLocalInput = (d) => {
    if (!d) return "";
    const x = new Date(d);
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0, 16); // yyyy-mm-ddThh:mm
  };

  const mapTenderToForm = (t) => ({
    ...initialFormState,

    deliveryWindow: {
      from: t?.deliveryWindow?.from ? toDateInputLocal(t.deliveryWindow.from) : "",
      to: t?.deliveryWindow?.to ? toDateInputLocal(t.deliveryWindow.to) : "",
    },
    closingDate: t?.closeDate ? toDateInputLocal(t.closeDate) : "",

    biddingStart: t?.biddingStart ? toDateTimeLocalInput(t.biddingStart) : "",
    biddingEnd: t?.biddingSoftEnd
      ? toDateTimeLocalInput(t.biddingSoftEnd)
      : t?.biddingEnd
        ? toDateTimeLocalInput(t.biddingEnd)
        : "",
    biddingHardEnd: t?.biddingHardEnd ? toDateTimeLocalInput(t.biddingHardEnd) : "",

    pickup: { ...blankLocation, ...(t?.pickup || {}) },
    drop: { ...blankLocation, ...(t?.drop || {}) },

    projectName: t?.projectName || "",
    projectCode: t?.projectCode || "",
    purchaseOrder: t?.purchaseOrder || "",
    projectRemark: t?.projectRemark || "",

    materials: Array.isArray(t?.materials)
      ? t.materials.map((m) => ({
        hsnCode: m?.hsnCode || "",
        hsnDigits: m?.hsnDigits || "",
        materialName: m?.materialName || "",
        quantity: m?.quantity ?? null,
        unit: m?.unit || "",
        remarks: m?.remarks || "",
      }))
      : [],

    vehicleRequirements: Array.isArray(t?.vehicleRequirements) ? t.vehicleRequirements : [],
    weight: t?.totalWeight != null ? String(t.totalWeight) : "",
    quantity: t?.totalQuantity != null ? String(t.totalQuantity) : "",

    remarks: t?.remarks || "",
    transporter: Array.isArray(t?.transporters) ? t.transporters.map(String) : [],

    minBidAmount: t?.minBidAmount != null ? String(t.minBidAmount) : "",
    maxBidAmount: t?.maxBidAmount != null ? String(t.maxBidAmount) : "",
    maxBidUnit: t?.maxBidUnit || "",
    priceDifference: t?.priceDifference != null ? String(t.priceDifference) : "",
  });

  const fetchTenderHistory = async (page = historyPage, limit = historyLimit, scope = historyScope) => {
    try {
      // Build URL: include userId only when scope === 'mine'
      const qUser = scope === "mine" && userId ? `&userId=${encodeURIComponent(userId)}` : "";
      const url = `${API.FETCH_ALL_TENDER_CREATED_BY_RRUSER}?page=${page}&limit=${limit}${qUser}`;

      const response = await axios.get(url, { withCredentials: true });
      const data = response?.data?.data || response?.data?.results || [];

      console.log("transporters detail", data);

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

  // useEffect(() => {
  //   if (viewHistory) {
  //     // include scope dependency so switching “mine/all” refetches
  //     fetchTenderHistory(historyPage, historyLimit, historyScope);
  //     fetchTransporters();
  //   }
  // }, [viewHistory, historyPage, historyLimit, historyScope]);

  useEffect(() => {
    if (screen === "history") {
      fetchTenderHistory(historyPage, historyLimit, historyScope);
      fetchTransporters();
    }
  }, [screen, historyPage, historyLimit, historyScope]);

  const handleHistoryScopeChange = (scope) => {
    setHistoryScope(scope);
    setHistoryPage(1); // reset pagination
  };

  // --- Create Tender form state ---
  const [form, setForm] = useState(initialFormState);
  const [selectedTransporters, setSelectedTransporters] = useState([]);
  // const [showMaterialModal, setShowMaterialModal] = useState(false);
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
    } else if (name === "maxBidAmount" || name === "minBidAmount") {
      const rounded = value ? parseInt(value, 10) : "";
      setForm((p) => ({ ...p, [name]: rounded === "" ? "" : String(rounded) }));
    }
    else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  // const handleRemoveMaterial = (indexToRemove) => {
  //   setForm((prev) => {
  //     const updatedMaterials = prev.materials.filter(
  //       (_, i) => i !== indexToRemove
  //     );
  //     let weight = prev.weight;
  //     let quantity = prev.quantity;
  //     if (!prev.isManualTotals) {
  //       weight = updatedMaterials
  //         .reduce((a, m) => a + Number(m.weight || 0), 0)
  //         .toFixed(2);
  //       quantity = updatedMaterials.reduce(
  //         (a, m) => a + Number(m.quantity || 0),
  //         0
  //       );
  //     }
  //     return { ...prev, materials: updatedMaterials, weight, quantity };
  //   });
  // };

  const handleRemoveMaterial = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      materials: (prev.materials || []).filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleTransporterSave = (selectedIds) => {
    setForm((p) => ({ ...p, transporter: selectedIds }));
    const objs = transporterList.filter((t) => selectedIds.includes(t._id));
    setSelectedTransporters(objs);
  };

  // const handleSend = async (e) => {
  //   e?.preventDefault?.();
  //   setLoading(true);
  //   setFormDisabled(true);

  //   const { from, to } = form.deliveryWindow;
  //   const fromDate = new Date(from);
  //   const toDate = new Date(to);
  //   const closing = new Date(form.closingDate);
  //   // const bidStart = new Date(form.biddingStart);
  //   // const bidEnd = new Date(form.biddingEnd);

  //   const bidStart = new Date(form.biddingStart);
  //   const bidSoftEnd = new Date(form.biddingEnd);

  //   // ✅ if user doesn't set hard end, treat hard = soft (no extension; same as current)
  //   const bidHardEnd = form.biddingHardEnd ? new Date(form.biddingHardEnd) : bidSoftEnd;

  //   if (fromDate > toDate) {
  //     toast.error("Delivery 'From' date must be before 'To' date.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (closing < fromDate || closing > toDate) {
  //     toast.error("Closing Date must be within the Delivery Window.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (bidStart < fromDate || bidStart > toDate) {
  //     toast.error("Bidding Start must be within the Delivery Window.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   // if (bidEnd < fromDate || bidEnd > toDate) {
  //   //   toast.error("Bidding End must be within the Delivery Window.");
  //   //   setLoading(false);
  //   //   setFormDisabled(false);
  //   //   return;
  //   // }

  //   // if (bidStart > bidEnd) {
  //   //   toast.error("Bidding Start cannot be after Bidding End.");
  //   //   setLoading(false);
  //   //   setFormDisabled(false);
  //   //   return;
  //   // }

  //   if (bidSoftEnd < fromDate || bidSoftEnd > toDate) {
  //     toast.error("Bidding (Soft End) must be within the Delivery Window.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (bidHardEnd < fromDate || bidHardEnd > toDate) {
  //     toast.error("Bidding (Hard Stop) must be within the Delivery Window.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (bidStart > bidSoftEnd) {
  //     toast.error("Bidding Start cannot be after Soft End.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (bidSoftEnd > bidHardEnd) {
  //     toast.error("Hard Stop must be >= Soft End.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   //  pickup/drop validation (required by backend)
  //   if (!form.pickup?.pincode || String(form.pickup.pincode).length !== 6 || !form.pickup?.address) {
  //     toast.error("Please fill Pickup PIN Code and Pickup Address.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (!form.drop?.pincode || String(form.drop.pincode).length !== 6 || !form.drop?.address) {
  //     toast.error("Please fill Drop PIN Code and Drop Address.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   //  vehicles validation
  //   if (!Array.isArray(form.vehicleRequirements) || form.vehicleRequirements.length === 0) {
  //     toast.error("Please add at least one vehicle requirement.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   // totals required when vehicles exist
  //   if (form.vehicleRequirements.length > 0 && (!form.weight || !form.quantity)) {
  //     toast.warning("Please enter total weight and quantity.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   // OPTIONAL validation: priceDifference present and non-negative integer
  //   if (form.priceDifference !== "" && Number.isNaN(parseInt(form.priceDifference, 10))) {
  //     toast.error("Price Difference must be a number (₹).");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (!form.maxBidUnit) {
  //     toast.error("Please select Unit Type (Per MT / Per Tender).");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   const minAmt = form.minBidAmount === "" ? null : parseInt(form.minBidAmount, 10);
  //   const maxAmt = form.maxBidAmount === "" ? null : parseInt(form.maxBidAmount, 10);

  //   if (minAmt === null || Number.isNaN(minAmt)) {
  //     toast.error("Please enter Min Bid Amount.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (maxAmt === null || Number.isNaN(maxAmt)) {
  //     toast.error("Please enter Max Bid Amount.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   if (minAmt > maxAmt) {
  //     toast.error("Min Bid Amount cannot be greater than Max Bid Amount.");
  //     setLoading(false);
  //     setFormDisabled(false);
  //     return;
  //   }

  //   const payload = {
  //     ...(sourceShipmentId && { shipmentPlanId: sourceShipmentId }),
  //     deliveryWindow: {
  //       from: form.deliveryWindow.from,
  //       to: form.deliveryWindow.to,
  //     },
  //     closeDate: form.closingDate,
  //     biddingStart: form.biddingStart,
  //     biddingEnd: form.biddingEnd,    // soft end
  //     ...(form.biddingHardEnd ? { biddingHardEnd: form.biddingHardEnd } : {}),

  //     // ✅ NEW
  //     pickup: {
  //       pincode: form.pickup.pincode,
  //       address: form.pickup.address,
  //       state: form.pickup.state || "",
  //       location: form.pickup.location || "",
  //       city: form.pickup.city || "",
  //       district: form.pickup.district || "",
  //       country: form.pickup.country || "India",
  //     },
  //     drop: {
  //       pincode: form.drop.pincode,
  //       address: form.drop.address,
  //       state: form.drop.state || "",
  //       location: form.drop.location || "",
  //       city: form.drop.city || "",
  //       district: form.drop.district || "",
  //       country: form.drop.country || "India",
  //     },

  //     // ✅ NEW
  //     vehicleRequirements: form.vehicleRequirements.map((v) => ({
  //       vehicleId: v.vehicleId,
  //       category: v.category,
  //       subCategory: v.subCategory,
  //       quantity: Number(v.quantity || 1),
  //     })),

  //     projectName: form.projectName,
  //     projectCode: form.projectCode,
  //     purchaseOrder: form.purchaseOrder,
  //     projectRemark: form.projectRemark,
  //     totalWeight: form.weight ? Number.parseFloat(form.weight) : null,
  //     totalQuantity: form.quantity ? Number.parseInt(form.quantity) : null,
  //     remarks: form.remarks,
  //     transporters: form.transporter,
  //     minBidAmount: form.minBidAmount === "" ? null : parseInt(form.minBidAmount, 10),
  //     maxBidAmount: form.maxBidAmount ? parseInt(form.maxBidAmount, 10) : null,
  //     maxBidUnit: form.maxBidUnit || null,
  //     priceDifference: form.priceDifference === "" ? null : parseInt(form.priceDifference, 10),

  //   };

  //   // console.log("response of tender form ", payload);

  //   try {
  //     const createRes = await axios.post(`${API.CREATE_TENDER}`, payload, {
  //       withCredentials: true,
  //     });

  //     // backend shape is { success: true, data: tender }
  //     const createdTender = createRes?.data?.data || createRes?.data;
  //     const tenderId = createdTender?._id;

  //     if (!tenderId) {
  //       console.warn("No tender _id returned from create API:", createRes?.data);
  //       toast.warn("Tender created, but ID missing in response.");
  //     }

  //     // keep your history list consistent with the backend shape
  //     if (createdTender) setTenderHistories((prev) => [createdTender, ...prev]);

  //     // setTenderHistories((prev) => [response.data, ...prev]);
  //     toast.success("Tender submitted successfully!");

  //     // NEW: if this tender was created from a shipment, mark that shipment as 'planned'
  //     if (sourceShipmentId) {
  //       try {
  //         await axios.put(
  //           `${API.SHIPMENT_DETAILS}/${sourceShipmentId}`,
  //           { status: "planned" },
  //           { withCredentials: true }
  //         );

  //         toast.success("Shipment marked as planned.");
  //         // // tell the Shipments tab to refresh next time we view it
  //         // setShipmentsRefreshSignal((n) => n + 1);
  //       } catch (markErr) {
  //         console.error("Failed to update shipment status:", markErr);
  //         toast.warn("Tender created, but failed to mark shipment as planned.");
  //       }
  //     }

  //     // 3) Notify users on WhatsApp using the tender ID
  //     if (tenderId) {
  //       try {
  //         await axios.post(
  //           `${API.WHATSAPP_NOTIFICATION}/${tenderId}/notify`,
  //           {},
  //           { withCredentials: true }
  //         );

  //         toast.success("WhatsApp notifications sent.");

  //       } catch (notifyErr) {
  //         console.error("Failed to send WhatsApp notifications:", notifyErr);
  //         toast.warn("Tender created, but failed to send WhatsApp notifications.");
  //       }
  //     }

  //     // Reset form
  //     setForm(initialFormState);
  //     setSelectedTransporters([]);
  //     setPrefilledFromShipment(false);
  //     setSourceShipmentId(null);

  //   } catch (error) {
  //     const msg =
  //       error?.response?.data?.message ||
  //       "Something went wrong. Please try again.";
  //     toast.error(msg);
  //   } finally {
  //     setLoading(false);
  //     setFormDisabled(false);
  //   }
  // };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setFormDisabled(true);

    try {
      const { from, to } = form.deliveryWindow;
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const closing = new Date(form.closingDate);

      const bidStart = new Date(form.biddingStart);
      const bidSoftEnd = new Date(form.biddingEnd);

      // ✅ if user doesn't set hard end, treat hard = soft (no extension; same as current)
      const bidHardEnd = form.biddingHardEnd ? new Date(form.biddingHardEnd) : bidSoftEnd;

      // ---------------- VALIDATIONS (unchanged) ----------------
      if (fromDate > toDate) {
        toast.error("Delivery 'From' date must be before 'To' date.");
        return;
      }

      if (closing < fromDate || closing > toDate) {
        toast.error("Closing Date must be within the Delivery Window.");
        return;
      }

      if (bidStart < fromDate || bidStart > toDate) {
        toast.error("Bidding Start must be within the Delivery Window.");
        return;
      }

      if (bidSoftEnd < fromDate || bidSoftEnd > toDate) {
        toast.error("Bidding (Soft End) must be within the Delivery Window.");
        return;
      }

      if (bidHardEnd < fromDate || bidHardEnd > toDate) {
        toast.error("Bidding (Hard Stop) must be within the Delivery Window.");
        return;
      }

      if (bidStart > bidSoftEnd) {
        toast.error("Bidding Start cannot be after Soft End.");
        return;
      }

      if (bidSoftEnd > bidHardEnd) {
        toast.error("Hard Stop must be >= Soft End.");
        return;
      }

      // pickup/drop validation (required by backend)
      if (
        !form.pickup?.pincode ||
        String(form.pickup.pincode).length !== 6 ||
        !form.pickup?.address
      ) {
        toast.error("Please fill Pickup PIN Code and Pickup Address.");
        return;
      }

      if (
        !form.drop?.pincode ||
        String(form.drop.pincode).length !== 6 ||
        !form.drop?.address
      ) {
        toast.error("Please fill Drop PIN Code and Drop Address.");
        return;
      }

      // vehicles validation
      if (!Array.isArray(form.vehicleRequirements) || form.vehicleRequirements.length === 0) {
        toast.error("Please add at least one vehicle requirement.");
        return;
      }

      // totals required when vehicles exist
      if (form.vehicleRequirements.length > 0 && (!form.weight || !form.quantity)) {
        toast.warning("Please enter total weight and quantity.");
        return;
      }

      // OPTIONAL validation: priceDifference present and non-negative integer
      if (form.priceDifference !== "" && Number.isNaN(parseInt(form.priceDifference, 10))) {
        toast.error("Price Difference must be a number (₹).");
        return;
      }

      if (!form.maxBidUnit) {
        toast.error("Please select Unit Type (Per MT / Per Tender).");
        return;
      }

      const minAmt = form.minBidAmount === "" ? null : parseInt(form.minBidAmount, 10);
      const maxAmt = form.maxBidAmount === "" ? null : parseInt(form.maxBidAmount, 10);

      if (minAmt === null || Number.isNaN(minAmt)) {
        toast.error("Please enter Min Bid Amount.");
        return;
      }

      if (maxAmt === null || Number.isNaN(maxAmt)) {
        toast.error("Please enter Max Bid Amount.");
        return;
      }

      if (minAmt > maxAmt) {
        toast.error("Min Bid Amount cannot be greater than Max Bid Amount.");
        return;
      }

      // ---------------- PAYLOAD (unchanged) ----------------
      const payload = {
        ...(sourceShipmentId && { shipmentPlanId: sourceShipmentId }),
        deliveryWindow: {
          from: form.deliveryWindow.from,
          to: form.deliveryWindow.to,
        },
        closeDate: form.closingDate,
        biddingStart: form.biddingStart,
        biddingEnd: form.biddingEnd, // soft end
        ...(form.biddingHardEnd ? { biddingHardEnd: form.biddingHardEnd } : {}),

        pickup: {
          pincode: form.pickup.pincode,
          address: form.pickup.address,
          state: form.pickup.state || "",
          location: form.pickup.location || "",
          city: form.pickup.city || "",
          district: form.pickup.district || "",
          country: form.pickup.country || "India",
        },
        drop: {
          pincode: form.drop.pincode,
          address: form.drop.address,
          state: form.drop.state || "",
          location: form.drop.location || "",
          city: form.drop.city || "",
          district: form.drop.district || "",
          country: form.drop.country || "India",
        },

        materials: (form.materials || []).map((m) => ({
          hsnCode: m.hsnCode,
          hsnDigits: m.hsnDigits,
          materialName: m.materialName,
          quantity:
            m.quantity === "" || m.quantity === null || m.quantity === undefined
              ? null
              : Number(m.quantity),
          unit: m.unit || "",
          remarks: m.remarks || "",
        })),

        vehicleRequirements: form.vehicleRequirements.map((v) => ({
          vehicleId: v.vehicleId,
          category: v.category,
          subCategory: v.subCategory,
          quantity: Number(v.quantity || 1),
        })),

        projectName: form.projectName,
        projectCode: form.projectCode,
        purchaseOrder: form.purchaseOrder,
        projectRemark: form.projectRemark,
        totalWeight: form.weight ? Number.parseFloat(form.weight) : null,
        totalQuantity: form.quantity ? Number.parseInt(form.quantity) : null,
        remarks: form.remarks,
        transporters: form.transporter,
        minBidAmount: form.minBidAmount === "" ? null : parseInt(form.minBidAmount, 10),
        maxBidAmount: form.maxBidAmount ? parseInt(form.maxBidAmount, 10) : null,
        maxBidUnit: form.maxBidUnit || null,
        priceDifference: form.priceDifference === "" ? null : parseInt(form.priceDifference, 10),
      };

      // ---------------- AUTH CFG ----------------
      const token = localStorage.getItem("session_token");
      const cfg = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        timeout: 15000,
      };

      // ---------------- CREATE or UPDATE DRAFT ----------------
      // ✅ If you are editing a draft -> update it
      if (editingDraft?._id) {
        const updRes = await axios.put(
          `${API.DRAFT_TENDER_UPDATE}/${editingDraft._id}`,
          payload,
          cfg
        );

        const updatedDraft = updRes?.data?.data || updRes?.data;
        setEditingDraft(updatedDraft);

        toast.success("Draft updated. It will auto-publish after timer ends.");

        // optional reset
        setForm(initialFormState);
        setSelectedTransporters([]);
        setPrefilledFromShipment(false);
        setSourceShipmentId(null);

        setScreen("drafts");
        return;
      }

      // ✅ Else -> create a new draft
      try {
        const createRes = await axios.post(API.DRAFT_TENDER_CREATE, payload, cfg);
        const createdDraft = createRes?.data?.data || createRes?.data;

        setEditingDraft(createdDraft);

        toast.success("Draft created. You have 3 minutes to edit.");
        console.log("draft available", createdDraft);

        // RESET FORM
        setForm(initialFormState);
        setSelectedTransporters([]);
        setPrefilledFromShipment(false);
        setSourceShipmentId(null);

        setScreen("drafts");
        return;
      } catch (err) {
        // Backend returns 409 when an active draft already exists
        if (err?.response?.status === 409) {
          const existing = err?.response?.data?.data;
          if (existing?._id) {
            setEditingDraft(existing);
            toast.info("You already have an active draft. Continue editing it.");
            setScreen("drafts");
            return;
          }
        }
        throw err;
      }

      // ❌ IMPORTANT: Do NOT notify WhatsApp here anymore.
      // Cron will publish + notify after 3 minutes.

      // ❌ IMPORTANT: Do NOT mark shipment as planned here (recommended).
      // If you do it now and draft gets cancelled, shipment will remain planned wrongly.
      // Move it to cron publish step instead.

    } catch (error) {
      const msg = error?.response?.data?.message || "Something went wrong. Please try again.";
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

      pickup: {
        ...blankLocation,
        state: shipment.dispatchLocation || "",
        address: shipment.address || "",
        pincode: shipment.pincode || "",
      },
      drop: { ...blankLocation }, // keep empty unless shipment provides drop
      vehicleRequirements: [],

      deliveryWindow: { from: "", to: "" },
      closingDate: "",
      biddingStart: "",
      biddingEnd: "",
      biddingHardEnd: "",
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

  const onEditDraft = (draft) => {
    setEditingDraft(draft);
    setForm(mapTenderToForm(draft));
    setSelectedTransporters([]); // optional
    setScreen("create");
    toast.info("You are editing a draft. Save changes before timer ends.");
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

  const navBtnClass =
    "px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 shadow-sm";

  const homeBtn = (
    <button onClick={() => setScreen("home")} className={navBtnClass}>
      <ArrowLeft className="h-4 w-4" /> Dashboard
    </button>
  );

  const createBtn = (
    <button
      onClick={() => {
        setEditingDraft(null);
        setScreen("create");
      }}
      className={navBtnClass}
    >
      <FilePlus2 className="h-4 w-4" /> Create
    </button>
  );

  const draftsBtn = (
    <button onClick={() => setScreen("drafts")} className={navBtnClass}>
      <ClipboardList className="h-4 w-4" /> Drafts
    </button>
  );

  const historyBtn = (
    <button onClick={() => setScreen("history")} className={navBtnClass}>
      <History className="h-4 w-4" /> History
    </button>
  );

  // show buttons based on screen (clean + non-confusing)
  const navActions = [
    screen !== "home" ? homeBtn : null,
    screen !== "create" ? createBtn : null,
    screen !== "drafts" ? draftsBtn : null,
    screen !== "history" ? historyBtn : null,
  ].filter(Boolean);

  const HomeCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <button
        onClick={() => {
          setEditingDraft(null);
          setScreen("create");
        }}
        className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
      >
        <div className="text-sm text-slate-500">Start</div>
        <div className="text-xl font-bold text-slate-900 mt-1">Create Tender</div>
        <div className="text-sm text-slate-600 mt-2">
          Create a tender and send it to transporters.
        </div>
        <div className="mt-4 inline-flex px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm">
          Open
        </div>
      </button>

      <button
        onClick={() => setScreen("drafts")}
        className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
      >
        <div className="text-sm text-slate-500">In progress</div>
        <div className="text-xl font-bold text-slate-900 mt-1">Draft Tenders</div>
        <div className="text-sm text-slate-600 mt-2">
          View drafts with a 3-minute timer. Edit or cancel before auto publish.
        </div>
        <div className="mt-4 inline-flex px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm">
          Open
        </div>
      </button>

      <button
        onClick={() => {
          setScreen("history");
          setViewHistory(true);
        }}
        className="text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
      >
        <div className="text-sm text-slate-500">Manage</div>
        <div className="text-xl font-bold text-slate-900 mt-1">Tender History</div>
        <div className="text-sm text-slate-600 mt-2">
          View history, filters, exports, and finalize flows.
        </div>
        <div className="mt-4 inline-flex px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm">
          Open
        </div>
      </button>
    </div>
  );

  return (
    // <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
    //   <Navbar
    //     title="Dashboard"
    //     userName={userName}
    //     actions={[historyButton]}
    //     onLogout={onLogout}
    //   />

    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    //     {viewHistory ? (
    //       <TenderHistoryAccordion
    //         tenderHistories={tenderHistories}
    //         transporterList={transporterList}
    //         fetchTenderHistory={fetchTenderHistory}
    //         page={historyMeta.page}
    //         limit={historyMeta.limit}
    //         totalPages={historyMeta.totalPages}
    //         totalCount={historyMeta.totalCount}
    //         onPageChange={(p) => setHistoryPage(p)}
    //         onLimitChange={(l) => {
    //           setHistoryLimit(l);
    //           setHistoryPage(1); // reset to first page when page size changes
    //         }}
    //         loading={historyLoading}
    //         scope={historyScope}
    //         onScopeChange={handleHistoryScopeChange}
    //         currentUserName={userName}
    //       />
    //     ) : (
    //       <>
    //         {/* Tabs */}
    //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-6">
    //           <div className="flex">
    //             {/* <button
    //               className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "shipment"
    //                 ? "bg-emerald-600 text-white shadow"
    //                 : "text-slate-700 hover:bg-slate-50"
    //                 }`}
    //               onClick={() => setActiveTab("shipment")}
    //              >
    //               <ClipboardList className="h-4 w-4" /> Shipment Details
    //             </button> */}

    //             <button
    //               className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "create"
    //                 ? "bg-emerald-600 text-white shadow"
    //                 : "text-slate-700 hover:bg-slate-50"
    //                 }`}
    //               onClick={() => setActiveTab("create")}
    //             >
    //               <FilePlus2 className="h-4 w-4" /> Create Tender
    //             </button>

    //             {/* NEW tab */}
    //             {/* <button
    //               className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === "planned"
    //                 ? "bg-emerald-600 text-white shadow"
    //                 : "text-slate-700 hover:bg-slate-50"
    //                 }`}
    //               onClick={() => setActiveTab("planned")}
    //              >
    //               <Calendar className="h-4 w-4" /> Shipment Planned
    //             </button> */}
    //           </div>
    //         </div>

    //         {/* Content */}
    //         {activeTab === "shipment" ? (
    //           <ShipmentDetailsTab
    //             isActive={activeTab === "shipment"}
    //             onCreateFromShipment={handlePrefillFromShipment}
    //           />
    //         ) : activeTab === "create" ? (
    //           <div id="create-tender-anchor" className="scroll-mt-16 space-y-4">
    //             {/* Prefill banner + Clear button */}
    //             {(prefilledFromShipment || true) && (
    //               <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    //                 <div className="text-sm text-emerald-800">
    //                   {prefilledFromShipment
    //                     ? "Form prefilled from Shipment Details. You can edit fields or clear the form to start fresh."
    //                     : "You can start a fresh tender or clear the form anytime."}
    //                 </div>
    //                 <div className="flex gap-2">
    //                   <button
    //                     onClick={clearForm}
    //                     type="button"
    //                     disabled={loading}
    //                     className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white"
    //                     title="Clear all form fields"
    //                   >
    //                     <RotateCcw className="h-4 w-4" />
    //                     Clear Form
    //                   </button>
    //                 </div>
    //               </div>
    //             )}

    //             <TenderForm
    //               form={form}
    //               setForm={setForm}
    //               handleChange={handleChange}
    //               handleSend={handleSend}
    //               setShowMaterialModal={setShowMaterialModal}
    //               setShowTransporterModal={setShowTransporterModal}
    //               handleRemoveMaterial={handleRemoveMaterial}
    //               selectedTransporters={selectedTransporters}
    //               loading={loading}
    //               formDisabled={formDisabled}
    //             />
    //           </div>
    //         ) : (
    //           // NEW content render
    //           <ShipmentPlannedTab
    //             onCreateFromShipment={handlePrefillFromShipment}
    //           />
    //         )}
    //       </>
    //     )}
    //   </div>

    //   {/* modals */}
    //   {showMaterialModal && (
    //     <MaterialModal
    //       close={() => setShowMaterialModal(false)}
    //       onAdd={(newMaterial) => {
    //         setForm((prev) => {
    //           const materials = [...prev.materials, newMaterial];
    //           let weight = prev.weight;
    //           let quantity = prev.quantity;
    //           if (!prev.isManualTotals) {
    //             weight = materials
    //               .reduce((sum, m) => sum + Number.parseFloat(m.weight || 0), 0)
    //               .toFixed(2);
    //             quantity = materials.reduce(
    //               (sum, m) => sum + Number.parseInt(m.quantity || 0),
    //               0
    //             );
    //           }
    //           return { ...prev, materials, weight, quantity };
    //         });
    //       }}
    //     />
    //   )}

    //   {showTransporterModal && (
    //     <TransporterModal
    //       selected={form.transporter}
    //       onClose={() => setShowTransporterModal(false)}
    //       onSave={handleTransporterSave}
    //       setTransporterList={setTransporterList}
    //     />
    //   )}
    // </div>

    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar
        title="Dashboard"
        userName={userName}
        actions={navActions}     // ✅ dynamic buttons, Navbar UI unchanged
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {screen === "home" && <HomeCards />}

        {screen === "drafts" && (
          <DraftTendersPanel
            onEditDraft={onEditDraft}
            onGoCreate={() => {
              setEditingDraft(null);
              setScreen("create");
            }}
            onGoHistory={() => setScreen("history")}
          />
        )}

        {screen === "history" && (
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
              setHistoryPage(1);
            }}
            loading={historyLoading}
            scope={historyScope}
            onScopeChange={handleHistoryScopeChange}
            currentUserName={userName}
          />
        )}

        {screen === "create" && (
          <div className="space-y-4">
            {editingDraft?._id && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-900">
                <b>Editing Draft:</b> Save your changes before the 3-minute timer ends.
                <div className="text-xs text-indigo-700 mt-1">
                  After timer ends, backend will publish and send notifications automatically.
                </div>
              </div>
            )}

            <TenderForm
              form={form}
              setForm={setForm}
              handleChange={handleChange}
              handleSend={handleSend}
              // setShowMaterialModal={setShowMaterialModal}
              setShowTransporterModal={setShowTransporterModal}
              handleRemoveMaterial={handleRemoveMaterial}
              selectedTransporters={selectedTransporters}
              loading={loading}
              formDisabled={formDisabled}
            />
          </div>
        )}
      </div>

      {/* ✅ keep your modals exactly same */}
      {/* {showMaterialModal && (
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
      )} */}

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
