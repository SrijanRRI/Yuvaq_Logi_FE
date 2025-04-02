import React, { useState } from 'react';
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";

const initialTenders = [
    {
        id: 1,
        rrName: 'RR User 1',
        deliveryDate: '2025-04-10',
        dispatchLocation: 'Warehouse A',
        address: '123 Steel Lane',
        pincode: '123456',
        materials: [
            { item: 'Steel Pipe', subItem: 'MS', weight: '200', quantity: '10' },
        ],
        remarks: 'Urgent delivery',
        transporter: 'RR Logistics'
    }
];

const CustomerDashboard = () => {
    const [tenders, setTenders] = useState(initialTenders);
    const [showModal, setShowModal] = useState(false);
    const [selectedTender, setSelectedTender] = useState(null);
    const [responseForm, setResponseForm] = useState({ price: '', vehicleNo: '', attachments: [] });

    const handleReject = (id) => {
        if (window.confirm('Are you sure you want to reject this tender?')) {
            setTenders((prev) => prev.filter((t) => t.id !== id));
        }
    };

    const handleApprove = (tender) => {
        setSelectedTender(tender);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        setResponseForm({ ...responseForm, attachments: Array.from(e.target.files) });
    };

    const handleResponseChange = (e) => {
        setResponseForm({ ...responseForm, [e.target.name]: e.target.value });
    };

    const handleSubmitResponse = () => {
        console.log('Approved Tender Response:', {
            ...responseForm,
            tenderId: selectedTender.id,
            rrUser: selectedTender.rrName,
        });
        alert('Tender response submitted to RR user.');
        setTenders((prev) => prev.filter((t) => t.id !== selectedTender.id));
        setShowModal(false);
        setSelectedTender(null);
        setResponseForm({ price: '', vehicleNo: '', attachments: [] });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Customer Dashboard</h2>

                {tenders.length === 0 ? (
                    <p className="text-gray-500">No pending tenders.</p>
                ) : (
                    <div className="space-y-6">
                        {tenders.map((tender) => (
                            <div key={tender.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                {/* Tender Header */}
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">Tender from {tender.rrName}</h3>

                                {/* Tender Details */}
                                <div className="text-gray-700 space-y-1">
                                    <p><strong>📦 Delivery:</strong> {tender.deliveryDate} | <strong>📍 Location:</strong> {tender.dispatchLocation}</p>
                                    <p><strong>🏠 Address:</strong> {tender.address} ({tender.pincode})</p>
                                    <p className="mb-2"><strong>🚚 Transporter:</strong> {tender.transporter}</p>
                                </div>

                                {/* Material List */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-inner">
                                    <h4 className="text-lg font-semibold mb-3">🛠️ Materials</h4>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-200 text-gray-700">
                                                <tr>
                                                    <th className="p-2">Material</th>
                                                    <th className="p-2">Sub Item</th>
                                                    <th className="p-2">Weight</th>
                                                    <th className="p-2">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y">
                                                {tender.materials.map((m, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-100">
                                                        <td className="p-2">{m.item}</td>
                                                        <td className="p-2">{m.subItem || "-"}</td>
                                                        <td className="p-2">{m.weight} kg</td>
                                                        <td className="p-2">{m.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Remarks */}
                                {tender.remarks && (
                                    <p className="mt-4 p-3 bg-gray-100 rounded-lg"><strong>📝 Remarks:</strong> {tender.remarks}</p>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:justify-center">
                                    <button
                                        onClick={() => handleReject(tender.id)}
                                        className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-2 rounded-lg w-full sm:w-auto hover:bg-red-600 transition-all"
                                    >
                                        <ImCross className="text-lg" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(tender)}
                                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg w-full sm:w-auto hover:bg-green-700 transition-all"
                                    >
                                        <TiTick className="text-lg" /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                )}

                {showModal && selectedTender && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                            <h3 className="text-lg font-bold mb-4">Tender Approval for {selectedTender.rrName}</h3>
                            <label className="block font-medium mb-1">Price</label>
                            <input name="price" value={responseForm.price} onChange={handleResponseChange} type="number"
                                className="w-full mb-4 px-3 py-2 border rounded" required />

                            <label className="block font-medium mb-1">Vehicle No.</label>
                            <input name="vehicleNo" value={responseForm.vehicleNo} onChange={handleResponseChange} type="text"
                                className="w-full mb-4 px-3 py-2 border rounded" required />

                            <label className="block font-medium mb-1">Attachments</label>
                            <input type="file" onChange={handleFileChange} multiple
                                className="w-full mb-4 px-3 py-2 border rounded" />

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                                <button onClick={handleSubmitResponse} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
