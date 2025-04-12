import { useState, useEffect } from "react"
import axios from "axios"
import API from "../API"
import { toast } from "react-toastify"
import { ConfirmationModal } from "../modals/ConfirmationModal"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../utils/UserSlice"

import AdminAllUsers from "./AdminPage/AdminAllUsers"
import AdminAllTenders from "./AdminPage/AdminAllTenders"
import AdminRequests from "./AdminPage/AdminRequests"

const AdminDashboardPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [requests, setRequests] = useState([])
    const [approvedUsers, setApprovedUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [confirmDialog, setConfirmDialog] = useState(null)
    const [approvingIndex, setApprovingIndex] = useState(null)

    const [allUsers, setAllUsers] = useState([])
    const [userFilter, setUserFilter] = useState("user")

    const [allTenders, setAllTenders] = useState([])

    const [activeTab, setActiveTab] = useState("dashboard")

    const userInfo = useSelector((state) => state.User?.userInfo)
    const userName = userInfo?.name || "Admin User"

    const fetchAllUsers = async () => {
        setLoading(true)
        try {
            const res = await axios.get(API.GETALLUSER)
            const users = Array.isArray(res.data) ? res.data : res.data?.data || []
            setAllUsers(users)
            setUserFilter("user") // Default filter
            setActiveTab("users")
            // console.log('All Users : ', res.data);
        } catch (err) {
            toast.error("Error fetching users.")
        } finally {
            setLoading(false)
        }
    }

    const fetchAllTenders = async () => {
        setLoading(true)
        try {
            const res = await axios.get(API.GETALLTENDER)
            const tenders = res.data?.data || res.data?.users || []
            setAllTenders(tenders)
            setActiveTab("tenders")

            console.log('All tenders : ', res.data);
        } catch (err) {
            // console.log("error" , err);
            toast.error("Error fetching tenders.")
        } finally {
            setLoading(false)
        }
    }

    const fetchPendingUsers = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API.ALLAPPROVALREQUEST}`)
            if (res.data.success) {
                setRequests(res.data.data)
            } else {
                setError("Failed to fetch users.")
                toast.error("Failed to fetch users.")
            }
        } catch (err) {
            console.error("Fetch error:", err)
            setError("An error occurred while fetching requests.")
            toast.error("An error occurred while fetching requests.")
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (index) => {
        const user = requests[index]
        setApprovingIndex(index)

        try {
            const res = await axios.put(`${API.APPROVEREQUEST}${user._id}`)

            if (res.data.success) {
                toast.success(`${user.name} approved successfully.`)
                setApprovedUsers((prev) => [...prev, user])
                setRequests((prev) => prev.filter((_, i) => i !== index))
            } else {
                toast.error("Failed to approve user.")
            }
        } catch (error) {
            console.error("Approval error:", error)
            toast.error("Something went wrong while approving user.")
        } finally {
            setApprovingIndex(null)
        }
    }

    const handleReject = async (index) => {
        const user = requests[index]

        setConfirmDialog({
            message: `Are you sure you want to reject ${user.name}?`,
            onConfirm: async () => {
                try {
                    const res = await axios.delete(`${API.REJECTREQUEST}${user._id}`)

                    if (res.data.success) {
                        toast.success(`${user.name} has been rejected.`)
                        setRequests((prev) => prev.filter((_, i) => i !== index))
                    } else {
                        toast.error("Failed to reject user: " + (res.data.message || ""))
                    }
                } catch (error) {
                    console.error("Rejection error:", error)
                    toast.error("Something went wrong while rejecting user.")
                } finally {
                    setConfirmDialog(null)
                }
            },
            onCancel: () => setConfirmDialog(null),
        })
    }

    useEffect(() => {
        if (activeTab === "requests") {
            fetchPendingUsers()
        }
    }, [activeTab])

    const handleLogout = async () => {
        try {
            await axios.post(API.LOGOUT_USER, {}, { withCredentials: true })
            dispatch(logout())
            toast.success("Logged out successfully!")
        } catch (err) {
            console.error("Logout failed:", err)
            toast.error("Logout failed. Please try again.")
        } finally {
            navigate("/signin")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold text-red-700">Admin Dashboard</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block">
                                <span className="text-gray-700"> Welcome, {userName} </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-300 font-semibold text-red-700 rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Navigation Tabs */}
                <div className="mb-6 bg-white rounded-xl shadow-sm p-1 flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md ${activeTab === "dashboard"
                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300"
                            }`}
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab("requests");
                            fetchPendingUsers();
                        }}
                        className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md ${activeTab === "requests"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300"
                            }`}
                    >
                        Requests
                    </button>

                    <button
                        onClick={fetchAllUsers}
                        className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md ${activeTab === "users"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300"
                            }`}
                    >
                        Users
                    </button>

                    <button
                        onClick={fetchAllTenders}
                        className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md ${activeTab === "tenders"
                            ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300"
                            }`}
                    >
                        Tenders
                    </button>
                </div>


                {/* Content Area */}
                <div className="px-4 py-6 sm:px-0">
                    {activeTab === "dashboard" && (
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 text-purple-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Admin Dashboard</h2>
                            <p className="text-gray-600 mb-8">Manage users, requests, and tenders from this central dashboard</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div
                                    onClick={() => {
                                        setActiveTab("requests")
                                        fetchPendingUsers()
                                    }}
                                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-purple-700"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-purple-800 text-lg mb-1">Pending Requests</h3>
                                    <p className="text-purple-600 text-sm">Manage transport user requests</p>
                                </div>

                                <div
                                    onClick={fetchAllUsers}
                                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-blue-700"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-blue-800 text-lg mb-1">Users</h3>
                                    <p className="text-blue-600 text-sm">View and manage all users</p>
                                </div>

                                <div
                                    onClick={fetchAllTenders}
                                    className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-green-700"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-green-800 text-lg mb-1">Tenders</h3>
                                    <p className="text-green-600 text-sm">View all tender information</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "users" && (
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => setUserFilter("user")}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${userFilter === "user" ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300"
                                            }`}
                                    >
                                        All Users
                                    </button>
                                    <button
                                        onClick={() => setUserFilter("transportUser")}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${userFilter === "transportUser"
                                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300"
                                            }`}
                                    >
                                        Transport Users
                                    </button>
                                </div>
                            </div>

                            <AdminAllUsers
                                users={allUsers.filter((user) => user.role === userFilter)}
                                title={userFilter === "user" ? "All Users" : "All Transport Users"}
                            />
                        </div>
                    )}

                    {activeTab === "requests" && (
                        <AdminRequests
                            requests={requests}
                            loading={loading}
                            approvingIndex={approvingIndex}
                            handleApprove={handleApprove}
                            handleReject={handleReject}
                        />
                    )}

                    {activeTab === "tenders" && <AdminAllTenders tenders={allTenders} />}

                </div>
            </main>

            {confirmDialog && (
                <ConfirmationModal
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </div>
    )
}

export default AdminDashboardPage
