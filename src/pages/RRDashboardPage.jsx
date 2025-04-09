import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MaterialModal } from "../modals/MaterialModal";
import Navbar from "../components/Navbar";
import { TransporterModal } from "../modals/TransporterModal";
import TenderForm from "../components/RRDashboard/TenderForm";
import TenderHistoryAccordion from "../components/RRDashboard/TenderHistoryAccordion";
import API from "../API";
import axios from "axios";
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";

const RRDashboardPage = () => {
  const navigate = useNavigate();

  const [viewHistory, setViewHistory] = useState(false);
  const [tenderHistories, setTenderHistories] = useState([]);

  const [form, setForm] = useState({
    deliveryWindow: { from: "", to: "" },
    closingDate: "",
    dispatchLocation: "",
    address: "",
    pincode: "",
    materials: [],
    weight: '',
    quantity: '',
    remarks: "",
    transporter: [],
    isManualTotals: false,
  });

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTransporterModal, setShowTransporterModal] = useState(false);

  const [transporterList, setTransporterList] = useState([]);
  const [selectedTransporters, setSelectedTransporters] = useState([]);

  const [loading, setLoading] = useState(false);

  const userInfo = useSelector((state) => state.User?.userInfo);
  const userName = userInfo?.name || "RR User";
  // console.log(userName);

  useEffect(() => {
    const fetchTenderHistory = async () => {
      try {
        const response = await axios.get(API.FETCH_ALL_TENDER_CREATED_BY_RRUSER, {
          withCredentials: true,
        });
        const data = response.data?.data || [];
        // console.log(response.data);
        setTenderHistories(data);
      } catch (err) {
        console.error("Failed to fetch tender history", err);
        // alert("Could not fetch tender history. Please try again later.");
        toast.error("Could not fetch tender history. Please try again later.");

      }
    };

    if (viewHistory) {
      fetchTenderHistory();
      fetchTransporters();
    }
  }, [viewHistory]);

  // Function to see the Transport's Name:
  const fetchTransporters = async () => {
    try {
      const res = await axios.get(API.FETCH_ALL_TRANSPORTER, { withCredentials: true });
      setTransporterList(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch transporters", error);
    }
  };


  const handleChange = (e) => {
    const { name, value, options } = e.target;

    if (name === "transporter") {
      const selected = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setForm({ ...form, [name]: selected });
    } else if (name === "weight" || name === "quantity") {
      setForm({ ...form, [name]: value, isManualTotals: true });
    } else {
      setForm({ ...form, [name]: value });
    }
  };


  const handleRemoveMaterial = (indexToRemove) => {
    setForm((prev) => {
      const updatedMaterials = prev.materials.filter((_, idx) => idx !== indexToRemove);

      let weight = prev.weight;
      let quantity = prev.quantity;

      if (!prev.isManualTotals) {
        weight = updatedMaterials.reduce((acc, mat) => acc + Number(mat.weight || 0), 0).toFixed(2);
        quantity = updatedMaterials.reduce((acc, mat) => acc + Number(mat.quantity || 0), 0);
      }

      return {
        ...prev,
        materials: updatedMaterials,
        weight,
        quantity,
      };
    });
  };


  const handleTransporterSave = (selectedIds) => {
    setForm((prev) => ({ ...prev, transporter: selectedIds }));
    const selectedObjs = transporterList.filter((t) =>
      selectedIds.includes(t._id)
    );
    setSelectedTransporters(selectedObjs);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.materials.length > 0) {
      if (!form.weight || !form.quantity) {
        alert("Please enter total weight and quantity.");
        return;
      }
    }

    const payload = {
      deliveryWindow: {
        from: form.deliveryWindow.from,
        to: form.deliveryWindow.to,
      },
      closeDate: form.closingDate,
      dispatchLocation: form.dispatchLocation,
      address: form.address,
      pincode: form.pincode,
      totalWeight: form.weight ? parseFloat(form.weight) : null,
      totalQuantity: form.quantity ? parseInt(form.quantity) : null,
      remarks: form.remarks,
      transporters: form.transporter,
      materials: form.materials.map((mat) => ({
        material: mat.item,
        subMaterial: mat.subItem || null,
        weight: parseFloat(mat.weight),
        quantity: parseInt(mat.quantity),
      })),
    };

    try {
      const response = await axios.post(`${API.CREATE_TENDER}`, payload, {
        withCredentials: true,
      });
      setTenderHistories((prev) => [response.data, ...prev]);
      // alert("Tender submitted successfully!");
      toast.success("Tender submitted successfully!");

      setForm({
        deliveryWindow: { from: "", to: "" },
        closingDate: "",
        dispatchLocation: "",
        address: "",
        pincode: "",
        materials: [],
        weight: "",
        quantity: "",
        remarks: "",
        transporter: [],
        isManualTotals: false,
      });
    } catch (error) {
      const errMessage =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      // alert(errMessage);
      toast.error(errMessage);
    } finally {
      setLoading(false); // Stop loading whether success or error
    }
  };

  const handleLogout = () => {
    navigate("/signin");
  };

  const navbarActions = (
    <button
      onClick={() => setViewHistory(!viewHistory)}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      {viewHistory ? "Back to Dashboard" : "Tenders History"}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        title="RR Dashboard"
        userName={userName || "RR User "}
        actions={navbarActions}
        onLogout={handleLogout}
      />

      <div className="py-10 px-4 max-w-6xl mx-auto">
        {viewHistory ? (
          <TenderHistoryAccordion tenderHistories={tenderHistories} transporterList={transporterList} />
        ) : (
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
          />
        )}
      </div>

      {showMaterialModal && (
        <MaterialModal
          close={() => setShowMaterialModal(false)}
          onAdd={(newMaterial) => {
            setForm((prev) => {
              const updatedMaterials = [...prev.materials, newMaterial];
              let weight = prev.weight;
              let quantity = prev.quantity;

              if (!prev.isManualTotals) {
                weight = updatedMaterials.reduce(
                  (sum, mat) => sum + parseFloat(mat.weight || 0),
                  0
                ).toFixed(2);
                quantity = updatedMaterials.reduce(
                  (sum, mat) => sum + parseInt(mat.quantity || 0),
                  0
                );
              }

              return {
                ...prev,
                materials: updatedMaterials,
                weight,
                quantity,
              };
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
