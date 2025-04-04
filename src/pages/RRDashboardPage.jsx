import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MaterialModal } from '../modals/MaterialModal';
import Navbar from '../components/Navbar';
import { TransporterModal } from '../modals/TransporterModal';
import TenderForm from '../components/RRDashboard/TenderForm';
import TenderHistoryAccordion from '../components/RRDashboard/TenderHistoryAccordion';

const RRDashboardPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [viewHistory, setViewHistory] = useState(false);
  const [tenderHistories, setTenderHistories] = useState([]);

  const [form, setForm] = useState({
    deliveryDate: '',
    closingDate: '',
    dispatchLocation: '',
    address: '',
    pincode: '',
    materials: [],
    weight: '',
    quantity: '',
    remarks: '',
    transporter: [],
  });

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTransporterModal, setShowTransporterModal] = useState(false);

  // Dummy data for demonstration on mount
  useEffect(() => {
    const dummy = {
      deliveryDate: '2025-04-10',
      closingDate: '2025-04-08',
      dispatchLocation: 'Nagpur Yard',
      address: 'Plot 22, Industrial Area, Nagpur',
      pincode: '440001',
      remarks: 'Handle with care',
      materials: [
        { item: 'Pipe', subItem: 'MS', weight: '200', quantity: '50' },
        { item: 'Angle', subItem: 'SS', weight: '100', quantity: '20' },
      ],
      responses: generateDummyResponses(['ABC Logistics', 'XYZ Transport']),
    };
    setTenderHistories([dummy]);
  }, []);

  const generateDummyResponses = (transporters) => {
    return transporters.map((name, index) => ({
      customerName: name,
      price: (Math.random() * 10000 + 40000).toFixed(2),
      vehicleNo: `MH12AB12${index + 1}`,
      attachments: ['invoice.pdf', 'photo1.jpg'],
      finalPrice: null,
    }));
  };

  const handleChange = (e) => {
    const { name, value, options } = e.target;
    if (name === 'transporter') {
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
      materials: prevForm.materials.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (!form.weight && !form.quantity) {
      alert('Please enter either Total Weight or Total Quantity.');
      return;
    }

    const tender = {
      deliveryDate: form.deliveryDate,
      closingDate: form.closingDate,
      dispatchLocation: form.dispatchLocation,
      address: form.address,
      pincode: form.pincode,
      remarks: form.remarks,
      materials: form.materials.map((mat) => ({
        item: mat.item,
        subItem: mat.subItem || null,
        weight: mat.weight,
        quantity: mat.quantity,
      })),
      responses: generateDummyResponses(form.transporter),
    };

    console.log('Tender Submitted:', tender);

    setTenderHistories((prev) => [tender, ...prev]);

    setForm({
      deliveryDate: '',
      closingDate: '',
      dispatchLocation: '',
      address: '',
      pincode: '',
      materials: [],
      weight: '',
      quantity: '',
      remarks: '',
      transporter: [],
    });

    alert('Tender saved locally!');
  };

  const handleLogout = () => {
    navigate('/signin');
  };

  const navbarActions = (
    <button
      onClick={() => setViewHistory(!viewHistory)}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      {viewHistory ? 'Back to Dashboard' : 'Tenders History'}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        title="RR Dashboard"
        userName={state?.name || 'RR User'}
        actions={navbarActions}
        onLogout={handleLogout}
      />

      <div className="py-10 px-4 max-w-6xl mx-auto">
        {viewHistory ? (
          <TenderHistoryAccordion tenderHistories={tenderHistories} />
        ) : (
          <TenderForm
            form={form}
            handleChange={handleChange}
            handleSend={handleSend}
            setShowMaterialModal={setShowMaterialModal}
            setShowTransporterModal={setShowTransporterModal}
            handleRemoveMaterial={handleRemoveMaterial}
          />
        )}
      </div>

      {showMaterialModal && (
        <MaterialModal
          close={() => setShowMaterialModal(false)}
          onAdd={(newMaterial) =>
            setForm((prev) => ({ ...prev, materials: [...prev.materials, newMaterial] }))
          }
        />
      )}

      {showTransporterModal && (
        <TransporterModal
          selected={form.transporter}
          onClose={() => setShowTransporterModal(false)}
          onSave={(selectedTransporters) =>
            setForm((prev) => ({ ...prev, transporter: selectedTransporters }))
          }
        />
      )}
    </div>
  );
};

export default RRDashboardPage;
