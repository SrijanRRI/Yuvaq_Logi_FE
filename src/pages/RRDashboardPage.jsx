import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MaterialModal } from "../modals/MaterialModal";
import Navbar from "../components/Navbar";
import { TransporterModal } from "../modals/TransporterModal";
import TenderForm from "../components/RRDashboard/TenderForm";
import TenderHistoryAccordion from "../components/RRDashboard/TenderHistoryAccordion";
import API from "../API";
import axios from "axios";

const RRDashboardPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [viewHistory, setViewHistory] = useState(false);
  const [tenderHistories, setTenderHistories] = useState([]);

  const [form, setForm] = useState({
    deliveryDate: "",
    closingDate: "",
    dispatchLocation: "",
    address: "",
    pincode: "",
    materials: [],
    // weight: '',
    // quantity: '',
    remarks: "",
    transporter: [],
  });

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTransporterModal, setShowTransporterModal] = useState(false);

  const [transporterList, setTransporterList] = useState([]);
  const [selectedTransporters, setSelectedTransporters] = useState([]);

  useEffect(() => {
    const fetchTenderHistory = async () => {
      try {
        const response = await axios.get(API.FETCH_ALL_TENDER_CREATED_BY_RRUSER, {
          withCredentials: true,
        });
        const data = response.data?.data || [];
        setTenderHistories(data);
      } catch (err) {
        console.error("Failed to fetch tender history", err);
        alert("Could not fetch tender history. Please try again later.");
      }
    };

    if (viewHistory) {
      fetchTenderHistory();
    }
  }, [viewHistory]);


  // const generateDummyResponses = (transporters) => {
  //   return transporters.map((name, index) => ({
  //     customerName: name,
  //     price: (Math.random() * 10000 + 40000).toFixed(2),
  //     vehicleNo: `MH12AB12${index + 1}`,
  //     attachments: ['invoice.pdf', 'photo1.jpg'],
  //     finalPrice: null,
  //   }));
  // };

  const handleChange = (e) => {
    const { name, value, options } = e.target;
    if (name === "transporter") {
      const selected = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setForm({ ...form, [name]: selected });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleRemoveMaterial = (indexToRemove) => {
    setForm((prevForm) => ({
      ...prevForm,
      materials: prevForm.materials.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
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

    const payload = {
      dateOfDelivery: form.deliveryDate,
      closeDate: form.closingDate,
      dispatchLocation: form.dispatchLocation,
      address: form.address,
      pincode: form.pincode,
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
      alert("Tender submitted successfully!");
      setForm({
        deliveryDate: "",
        closingDate: "",
        dispatchLocation: "",
        address: "",
        pincode: "",
        materials: [],
        remarks: "",
        transporter: [],
      });
    } catch (error) {
      const errMessage =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      alert(errMessage);
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
        userName={state?.name || "RR User"}
        actions={navbarActions}
        onLogout={handleLogout}
      />

      <div className="py-10 px-4 max-w-6xl mx-auto">
        {viewHistory ? (
          <TenderHistoryAccordion tenderHistories={tenderHistories}  transporterList={transporterList}/>
        ) : (
          <TenderForm
            form={form}
            handleChange={handleChange}
            handleSend={handleSend}
            setShowMaterialModal={setShowMaterialModal}
            setShowTransporterModal={setShowTransporterModal}
            handleRemoveMaterial={handleRemoveMaterial}
            selectedTransporters={selectedTransporters}
          />
        )}
      </div>

      {showMaterialModal && (
        <MaterialModal
          close={() => setShowMaterialModal(false)}
          onAdd={(newMaterial) =>
            setForm((prev) => ({
              ...prev,
              materials: [...prev.materials, newMaterial],
            }))
          }
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
