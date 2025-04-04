import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MaterialModal } from '../modals/MaterialModal';
import Navbar from '../components/Navbar';
import { TransporterModal } from '../modals/TransporterModal';
import TenderForm from '../components/RRDashboard/TenderForm';
import TenderHistoryAccordion from '../components/RRDashboard/TenderHistoryAccordion';
import API from '../API';

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

    const [finalPrices, setFinalPrices] = useState({});
    const [editingIdx, setEditingIdx] = useState(null);
    const [priceInput, setPriceInput] = useState('');
    const [confirmedIdx, setConfirmedIdx] = useState(null);

    const generateDummyResponses = (transporters) => {
        return transporters.map((name, index) => ({
            customerName: name,
            price: (Math.random() * 10000 + 40000).toFixed(2),
            vehicleNo: `MH12AB12${index + 1}`,
            attachments: ['invoice.pdf', 'photo1.jpg'],
            finalPrice: null
        }));
    };

    const handleChange = (e) => {
        const { name, value, options } = e.target;
        if (name === "transporter") {
            const selected = Array.from(options).filter(option => option.selected).map(option => option.value);
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

    const handleSend = async (e) => {
        e.preventDefault();

        if (!form.weight && !form.quantity) {
            alert("Please enter either Total Weight or Total Quantity.");
            return;
        }

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
                weight: mat.weight,
                quantity: mat.quantity
            })),
            // Optional dummy responses if needed
            responses: generateDummyResponses(form.transporter)
        };

        try {
            const response = await axios.post(`${API.CREATE_TENDER}`, payload);
            alert("Tender sent successfully!");

            setTenderHistories(prev => [response.data.tender, ...prev]);

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
        } catch (error) {
            console.error("Error sending tender:", error);
            alert("Failed to send tender. Please try again.");
        }
    };


    const handleLogout = () => {
        navigate('/signin');
    };

    const handleConfirm = (idx) => {
        setEditingIdx(idx);
        setPriceInput(finalPrices[idx] || '');
    };

    const handleDone = (idx) => {
        const confirm = window.confirm("Are you sure you want to finalize this quotation?");
        if (confirm) {
            setFinalPrices((prev) => ({ ...prev, [idx]: priceInput }));
            setEditingIdx(null);
            setConfirmedIdx(idx);
        }
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
                userName={state?.name || "RR User"}
                actions={navbarActions}
                onLogout={handleLogout}
            />

            <div className="py-10 px-4 max-w-6xl mx-auto">
                {viewHistory ? (
                    <TenderHistoryAccordion
                        tenderHistories={tenderHistories}
                        finalPrices={finalPrices}
                        handleConfirm={handleConfirm}
                        editingIdx={editingIdx}
                        priceInput={priceInput}
                        setPriceInput={setPriceInput}
                        handleDone={handleDone}
                        confirmedIdx={confirmedIdx}
                    />
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
                        setForm(prev => ({ ...prev, materials: [...prev.materials, newMaterial] }))
                    }
                />
            )}

            {showTransporterModal && (
                <TransporterModal
                    selected={form.transporter}
                    onClose={() => setShowTransporterModal(false)}
                    onSave={(selectedTransporters) =>
                        setForm(prev => ({ ...prev, transporter: selectedTransporters }))
                    }
                />
            )}
        </div>
    );
};

export default RRDashboardPage;
