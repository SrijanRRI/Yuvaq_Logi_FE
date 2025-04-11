import React, { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import Navbar from "../components/Navbar";
import { PiCheckFatFill } from "react-icons/pi";
import axios from "axios";
import API from "../API";
import { toast } from 'react-toastify';
import { ConfirmationModal } from "../modals/ConfirmationModal";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/UserSlice"

const AdminDashboardPage = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [requests, setRequests] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [showRequests, setShowRequests] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [approvingIndex, setApprovingIndex] = useState(null);

    const userInfo = useSelector((state) => state.User?.userInfo);
    const userName = userInfo?.name || "RR User";
    // console.log(userName);

    const [data] = useState([
        {
            rrName: "RR User 1",
            deliveryDate: "2025-04-10",
            dispatchLocation: "Warehouse A",
            address: "123 Steel Lane",
            pincode: "123456",
            transporter: "RR Logistics",
            materials: [
                { item: "Steel Pipe", subItem: "MS", weight: "200", quantity: "10" },
            ],
            customerResponses: [
                {
                    customer: "Customer A",
                    price: "45000",
                    vehicleNo: "MH12AB1234",
                    attachments: ["invoice.pdf"],
                    finalPrice: "44000",
                },
                {
                    customer: "Customer B",
                    price: "46000",
                    vehicleNo: "MH12XY5678",
                    attachments: ["quote.jpg"],
                    finalPrice: null,
                },
            ],
        },
    ]);


    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API.ALLAPPROVALREQUEST}`); // Replace with actual URL
            if (res.data.success) {
                setRequests(res.data.data);
            } else {
                setError("Failed to fetch users.");
                toast.error("Failed to fetch users.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("An error occurred while fetching requests.");
            toast.error("An error occurred while fetching requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (index) => {
        const user = requests[index];
        // console.log(user);
        setApprovingIndex(index);

        try {
            const res = await axios.put(
                `${API.APPROVEREQUEST}` + `${user._id}`);

            if (res.data.success) {
                // alert(`${user.name} approved successfully.`);
                toast.success(`${user.name} approved successfully.`);
                setApprovedUsers((prev) => [...prev, user]);
                setRequests((prev) => prev.filter((_, i) => i !== index));
            } else {
                // alert("Failed to approve user.");
                toast.error("Failed to approve user.");
            }
        } catch (error) {
            console.error("Approval error:", error);
            alert("Something went wrong while approving user.");
        }
        finally {
            setApprovingIndex(null); // Stop loading state
        }
    };

    const handleReject = async (index) => {
        const user = requests[index];
        // const confirmReject = window.confirm(`Are you sure you want to reject ${user.name}?`);

        // if (!confirmReject) return;

        setConfirmDialog({
            message: `Are you sure you want to reject ${user.name}?`,
            onConfirm: async () => {
                try {
                    const res = await axios.delete(
                        `${API.REJECTREQUEST}` + `${user._id}`);

                    if (res.data.success) {
                        // alert(`${user.name} has been rejected.`);
                        toast.success(`${user.name} has been rejected.`);
                        setRequests((prev) => prev.filter((_, i) => i !== index));
                    } else {
                        // alert("Failed to reject user: " + (res.data.message || ""));
                        toast.error("Failed to reject user: " + (res.data.message || ""));
                    }
                } catch (error) {
                    console.error("Rejection error:", error);
                    //   alert("Something went wrong while rejecting user.");
                    toast.error("Something went wrong while rejecting user.");
                } finally {
                    setConfirmDialog(null);
                }
            },
            onCancel: () => setConfirmDialog(null),
        });
    };

    useEffect(() => {
        if (showRequests) {
            fetchPendingUsers();
        }
    }, [showRequests]);

    const handleLogout = async () => {
        try {
            await axios.post(API.LOGOUT_USER, {}, { withCredentials: true })
            dispatch(logout()) // Clear Redux state
            toast.success("Logged out successfully!")
        } catch (err) {
            console.error("Logout failed:", err)
            toast.error("Logout failed. Please try again.")
        } finally {
            navigate("/signin")
        }
    }


    const navbarActions = (
        <button
            onClick={() => setShowRequests(!showRequests)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
            {showRequests ? "Back to Dashboard" : "Requests"}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar
                title="Admin Dashboard"
                userName={userName || "Admin"}
                actions={navbarActions}
                onLogout={handleLogout}
            />

            <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4">
                {showRequests ? (
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Transport User Requests</h2>

                        {loading ? (
                            <p className="text-blue-500">Loading requests...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : requests.length === 0 ? (
                            <p className="text-gray-500">No pending requests.</p>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((user, idx) => (
                                    <div key={idx} className="bg-gray-50 border rounded p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                        <div className="mb-2 sm:mb-0">
                                            <p><strong>Name:</strong> {user.name}</p>
                                            <p><strong>Email:</strong> {user.email}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(idx)}
                                                disabled={approvingIndex === idx}
                                                className={`flex items-center gap-2 px-4 py-1 rounded text-white ${approvingIndex === idx ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>

                                                {approvingIndex === idx ? (
                                                    <>
                                                        <span className="flex items-center gap-2">
                                                            <svg
                                                                className="animate-spin h-4 w-4 text-white"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8v8H4z"
                                                                ></path>
                                                            </svg>
                                                            Approving...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <PiCheckFatFill className="text-sm" /> Approve
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleReject(idx)}
                                                className="flex items-center gap-1 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                <ImCross className="text-sm" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {approvedUsers.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-2">Approved Users</h3>
                                <div className="space-y-2">
                                    {approvedUsers.map((user, idx) => (
                                        <div key={idx} className="border border-green-300 bg-green-50 rounded px-4 py-2">
                                            <p><strong>{user.name}</strong> - {user.email}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Dashboard content using mockRRData */}
                        {data.map((entry, idx) => (
                            <div key={idx} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                                    {entry.rrName}
                                </h2>
                                <p><strong>Delivery Date:</strong> {entry.deliveryDate} | <strong>Location:</strong> {entry.dispatchLocation}</p>
                                <p><strong>Address:</strong> {entry.address} ({entry.pincode})</p>
                                <p><strong>Transporter:</strong> {entry.transporter}</p>

                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Materials</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {entry.materials.map((mat, mIdx) => (
                                            <li key={mIdx}>
                                                {mat.item} ({mat.subItem}) - {mat.weight}kg × {mat.quantity} pcs
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-semibold text-gray-800 mb-2">Customer Quotations</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {entry.customerResponses.map((res, rIdx) => (
                                            <div key={rIdx} className={`p-4 rounded border ${res.finalPrice ? "bg-green-50 border-green-400" : "bg-yellow-50 border-yellow-400"}`}>
                                                <p><strong>Customer:</strong> {res.customer}</p>
                                                <p><strong>Quoted Price:</strong> ₹{res.price}</p>
                                                <p><strong>Vehicle No:</strong> {res.vehicleNo}</p>
                                                <p><strong>Attachments:</strong> {res.attachments.join(", ")}</p>
                                                {res.finalPrice && (
                                                    <p className="mt-2 font-bold text-green-700">
                                                        Final Deal Price: ₹{res.finalPrice}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {confirmDialog && (
                <ConfirmationModal
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </div>


    );
};

export default AdminDashboardPage;
