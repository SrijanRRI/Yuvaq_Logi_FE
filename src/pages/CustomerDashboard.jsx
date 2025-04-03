import { useState } from "react"
import { ImCross } from "react-icons/im"
import { PiCheckFatFill } from "react-icons/pi";
import { TbTruckDelivery } from "react-icons/tb";
import { IoIosHome } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { BiSolidBox } from "react-icons/bi";
import { FaTools } from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";
import { useNavigate } from "react-router-dom"
import Navbar from '../components/Navbar';

const initialTenders = [
    {
        id: 1,
        rrName: "RR User 1",
        deliveryDate: "2025-04-10",
        dispatchLocation: "Warehouse A",
        address: "123 Steel Lane",
        pincode: "123456",
        materials: [{ item: "Steel Pipe", subItem: "MS", weight: "200", quantity: "10" }],
        remarks: "Urgent delivery",
        transporter: "RR Logistics",
    },
    {
        id: 2,
        rrName: "RR User 2",
        deliveryDate: "2025-04-15",
        dispatchLocation: "Warehouse B",
        address: "456 Metal Avenue",
        pincode: "234567",
        materials: [{ item: "Steel Pipe", subItem: "MS", weight: "200", quantity: "10" }],
        remarks: "Urgent delivery",
        transporter: "RR Logistics",
    },
    {
        id: 3,
        rrName: "RR User 3",
        deliveryDate: "2025-04-20",
        dispatchLocation: "Warehouse C",
        address: "789 Iron Street",
        pincode: "345678",
        materials: [{ item: "Steel Pipe", subItem: "MS", weight: "200", quantity: "10" }],
        remarks: "Urgent delivery",
        transporter: "RR Logistics",
    },
]

const CustomerDashboard = () => {
    const [tenders, setTenders] = useState(initialTenders)
    const [history, setHistory] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [selectedTender, setSelectedTender] = useState(null)
    const [responseForm, setResponseForm] = useState({ price: "", vehicleNo: "", attachments: [] })
    const [view, setView] = useState(false)
    const customerName = "Customer Name" // Replace with actual name if available

    const navigate = useNavigate()

    const handleReject = (id) => {
        if (window.confirm("Are you sure you want to reject this tender?")) {
            setTenders((prev) => prev.filter((t) => t.id !== id))
        }
    }

    const handleApprove = (tender) => {
        setSelectedTender(tender)
        setShowModal(true)
    }

    const handleFileChange = (e) => {
        setResponseForm({ ...responseForm, attachments: Array.from(e.target.files) })
    }

    const handleResponseChange = (e) => {
        setResponseForm({ ...responseForm, [e.target.name]: e.target.value })
    }

    const handleSubmitResponse = () => {
        const approvedEntry = {
            ...selectedTender,
            ...responseForm,
        }
        console.log("Approved Tender Response:", approvedEntry)
        alert("Tender response submitted to RR user.")
        setTenders((prev) => prev.filter((t) => t.id !== selectedTender.id))
        setHistory((prev) => [approvedEntry, ...prev])
        setShowModal(false)
        setSelectedTender(null)
        setResponseForm({ price: "", vehicleNo: "", attachments: [] })
    }

    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to delete all history?")) {
            setHistory([])
        }
    }

    const handleDeleteHistoryItem = (index) => {
        if (window.confirm("Delete this history entry?")) {
            setHistory((prev) => prev.filter((_, idx) => idx !== index))
        }
    }

    const handleLogout = () => {
        navigate("/signin")
    }

    // Navbar button toggle (same pattern as RRDashboard)
    const navbarActions = (
        <button
            onClick={() => setView(!view)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
            {view ? "Back to Dashboard" : "View History"}
        </button>
    )

    return (
        <div className="min-h-screen bg-gray-100">

            <Navbar
                title="Transporter Dashboard"
                userName={customerName}
                actions={navbarActions}
                onLogout={handleLogout}
            />

            <div className="py-6 sm:py-10 px-4 max-w-5xl mx-auto">
                {view ? (
                    history.length > 0 ? (
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Submitted History</h3>

                                <button onClick={handleClearHistory} className="text-red-600 hover:text-white text-sm border-red-600 border border-solid p-2 hover:bg-red-600 rounded-lg">
                                    Delete All
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {history.map((entry, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded shadow border relative">
                                        <button
                                            onClick={() => handleDeleteHistoryItem(idx)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                            title="Delete Entry"
                                        >
                                            <ImCross className="text-sm mx-1 " />
                                        </button>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                            <p>
                                                <strong>RR User:</strong> {entry.rrName}
                                            </p>
                                            <p>
                                                <strong>Price:</strong> ₹{entry.price}
                                            </p>
                                            <p>
                                                <strong>Vehicle No:</strong> {entry.vehicleNo}
                                            </p>
                                            <p>
                                                <strong>Location:</strong> {entry.dispatchLocation}
                                            </p>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <p>
                                                <strong>Materials:</strong>{" "}
                                                {entry.materials
                                                    .map((m) => `${m.item} (${m.subItem || "-"}) x ${m.quantity}pcs, ${m.weight}kg`)
                                                    .join("; ")}
                                            </p>
                                            <p className="mt-1">
                                                <strong>Attachments:</strong>{" "}
                                                {entry.attachments.length > 0
                                                    ? entry.attachments.map((file) => (typeof file === "string" ? file : file.name)).join(", ")
                                                    : "None"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-40">
                            <p className="text-gray-500">No submission history available.</p>
                        </div>
                    )
                ) : tenders.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-gray-500">No pending tenders.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {tenders.map((tender) => (
                            <div key={tender.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
                                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
                                    Tender from {tender.rrName}
                                </h3>

                                <div className="text-sm sm:text-base text-gray-700 space-y-2">
                                    <p className="flex items-center gap-2">
                                        <BiSolidBox className="text-green-500 text-lg" /> <strong> Delivery:</strong> {tender.deliveryDate}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FaLocationDot className="text-red-500 text-lg" /> <strong> Location:</strong> {tender.dispatchLocation}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <IoIosHome className="text-blue-500 text-lg" /> <strong> Address:</strong> {tender.address} ({tender.pincode})
                                    </p>
                                    <p className="mb-2 flex items-center gap-2">
                                        <TbTruckDelivery className="text-yellow-500 text-lg" /> <strong> Transporter:</strong> {tender.transporter}
                                    </p>
                                </div>

                                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg shadow-inner">
                                    <h4 className="text-md sm:text-lg font-semibold mb-3 flex items-center gap-2">
                                        <FaTools className="text-gray-700 text-xl" /> Materials
                                    </h4>
                                    <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                        <table className="w-full text-left text-sm">
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

                                {tender.remarks && (
                                    <p className="mt-4 p-3 bg-gray-100 rounded-lg text-sm flex items-center gap-2">
                                        <MdLibraryBooks className="text-purple-500 text-lg" /> <strong> Remarks:</strong> {tender.remarks}
                                    </p>
                                )}

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
                                        <PiCheckFatFill className="text-xl" /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>

            {/* Responsive Modal */}
            {showModal && selectedTender && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">Tender Approval for {selectedTender.rrName}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium mb-1 text-sm">Price (₹)</label>
                                <input
                                    name="price"
                                    value={responseForm.price}
                                    onChange={handleResponseChange}
                                    type="number"
                                    placeholder="Enter price"
                                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-sm">Vehicle No.</label>
                                <input
                                    name="vehicleNo"
                                    value={responseForm.vehicleNo}
                                    onChange={handleResponseChange}
                                    type="text"
                                    placeholder="Enter vehicle number"
                                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-sm">Attachments</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    multiple
                                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload relevant documents (optional)</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded text-sm hover:bg-gray-100 order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitResponse}
                                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 order-1 sm:order-2"
                            >
                                Submit Response
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerDashboard