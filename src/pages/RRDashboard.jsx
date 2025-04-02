import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MaterialModal } from './MaterialModal';

const RRDashboard = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        deliveryDate: '',
        dispatchLocation: '',
        address: '',
        pincode: '',
        materials: [],
        weight: '',
        quantity: '',
        remarks: '',
        transporter: '',
    });

    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [viewResponses, setViewResponses] = useState(false);

    const [finalPrices, setFinalPrices] = useState({});
    const [editingIdx, setEditingIdx] = useState(null);
    const [priceInput, setPriceInput] = useState('');
    const [confirmedIdx, setConfirmedIdx] = useState(null);

    const approvedResponses = [
        {
            customerName: 'Customer A',
            price: '45000',
            vehicleNo: 'MH12AB1234',
            attachments: ['invoice.pdf', 'photo1.jpg']
        },
        {
            customerName: 'Customer B',
            price: '56000',
            vehicleNo: 'MH12AB1234',
            attachments: ['invoice.pdf', 'photo1.jpg']
        },
        {
            customerName: 'Customer C',
            price: '46000',
            vehicleNo: 'MH12AB1234',
            attachments: ['invoice.pdf', 'photo1.jpg']
        }
    ];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRemoveMaterial = (indexToRemove) => {
        setForm((prevForm) => ({
            ...prevForm,
            materials: prevForm.materials.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleSend = (e) => {
        e.preventDefault();
        console.log("Tender Sent", form);
        alert("Tender sent to customer!");
        // Add API call to send this to customer
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

    return (
        <>

            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-blue-600">RR Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-800 font-medium">{state?.name || 'RR User'}</span>
                        <button onClick={() => setViewResponses(!viewResponses)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            {viewResponses ? 'Back to Dashboard' : 'View Responses'}
                        </button>
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                            Logout
                        </button>
                    </div>
                </nav>

                <div className="py-10 px-4 max-w-6xl mx-auto">
                    {viewResponses ? (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">Approved Tender Responses</h2>
                            {approvedResponses.map((res, idx) => (
                                <div key={idx} className={`border p-4 rounded mb-4 transition duration-300 ${confirmedIdx !== null && confirmedIdx !== idx ? 'opacity-50 grayscale' : 'bg-gray-50 border-2 border-gray-300'}`}>
                                    <p><strong>Customer:</strong> {res.customerName}</p>
                                    <p><strong>Price:</strong> ₹{res.price}</p>
                                    <p><strong>Vehicle No:</strong> {res.vehicleNo}</p>
                                    <p><strong>Attachments:</strong> {res.attachments.join(', ')}</p>

                                    {finalPrices[idx] ? (
                                        <p className="mt-2 text-green-700 font-semibold">Final Deal Price: ₹{finalPrices[idx]}</p>
                                    ) : editingIdx === idx ? (
                                        <div className="mt-3 flex gap-2 items-center">
                                            <input
                                                type="number"
                                                value={priceInput}
                                                onChange={(e) => setPriceInput(e.target.value)}
                                                className="border px-3 py-1 rounded w-40"
                                                placeholder="Final Price"
                                            />
                                            <button
                                                onClick={() => handleDone(idx)}
                                                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    ) : (
                                        confirmedIdx === null && (
                                            <button
                                                onClick={() => handleConfirm(idx)}
                                                className="mt-3 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                            >
                                                Confirm Final Price
                                            </button>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-6">Create New Tender</h3>
                            <form onSubmit={handleSend} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium mb-1">Date of Delivery</label>
                                    <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Dispatch Location</label>
                                    <input type="text" name="dispatchLocation" value={form.dispatchLocation} onChange={handleChange}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-medium mb-1">Address</label>
                                    <textarea name="address" value={form.address} onChange={handleChange}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Pin Code</label>
                                    <input type="number" name="pincode" value={form.pincode} onChange={handleChange}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-medium mb-1">Material Details</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowMaterialModal(true)}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg text-left bg-gray-100 hover:bg-gray-200"
                                    >
                                        + Add Material
                                    </button>
                                    {form.materials.length > 0 && (
                                        <div className="mt-4 bg-white shadow-md rounded-lg p-4">
                                            <h3 className="text-lg font-semibold mb-3">Added Materials</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {form.materials.map((mat, index) => (
                                                    <div key={index} className="border p-4 rounded-lg bg-gray-50 shadow-sm flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-lg text-gray-800">{mat.item}</p>
                                                            {mat.subItem && <p className="text-gray-600 text-medium">➝ {mat.subItem}</p>}
                                                            <p className="text-sm text-gray-700">{mat.weight}kg × {mat.quantity} pcs</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMaterial(index)}
                                                            className="ml-4 text-red-500 hover:text-red-700"
                                                        >
                                                            ❌
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Total Weight</label>
                                    <input type="number" name="weight" value={form.weight} onChange={handleChange}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Total Quantity</label>
                                    <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-medium mb-1">Remarks (Optional)</label>
                                    <textarea name="remarks" value={form.remarks} onChange={handleChange}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-medium mb-1">Select Transporter</label>
                                    <select
                                        name="transporter"
                                        value={form.transporter}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                                    >
                                        <option value="" disabled>Select a transporter</option>
                                        <option value="RR Logistics">RR Logistics</option>
                                        <option value="ABC Transports">ABC Transports</option>
                                        <option value="XYZ Freight">XYZ Freight</option>
                                        <option value="FastTrack Movers">FastTrack Movers</option>
                                    </select>
                                </div>
                                <div className="col-span-2 text-right">
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                        Send Tender
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {showMaterialModal && (
                        <MaterialModal
                            close={() => setShowMaterialModal(false)}
                            onAdd={(newMaterial) =>
                                setForm((prev) => ({ ...prev, materials: [...prev.materials, newMaterial] }))
                            }
                        />
                    )}
                </div>

            </div>
        </>
    );
};

export default RRDashboard;
