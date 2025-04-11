import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import axios from "axios"
import {
  CheckCircle,
  XCircle,
  Home,
  MapPin,
  Package,
  PenToolIcon as Tool,
  FileText,
  Clock,
  Calendar,
  Truck,
  DollarSign,
  FileUp,
  CheckCheck,
  Award
} from "lucide-react"
import Navbar from "../components/Navbar"
import { ConfirmationModal } from "../modals/ConfirmationModal"
import API from "../API"

import { useDispatch } from "react-redux"
import { logout } from "../utils/UserSlice"

const TransporterDashboardPage = () => {
  const [tenders, setTenders] = useState([])
  const [history, setHistory] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedTender, setSelectedTender] = useState(null)
  const [responseForm, setResponseForm] = useState({
    price: "",
    vehicleNo: "",
    attachments: [],
  })
  const [view, setView] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)
  const [transporters, setTransporters] = useState([])
  const [transporterMap, setTransporterMap] = useState({})

  const navigate = useNavigate()
  const dispatch = useDispatch()


  const userInfo = useSelector((state) => state.User?.userInfo)
  const userName = userInfo?.name || "RR User"

  const fetchTenders = async () => {
    try {
      const res = await fetch(`${API.FETCH_ALL_TENDERS}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await res.json()
      // console.log("fetch all tenders : ", data.data)

      const userId = userInfo?._id

      // Mark tenders where this user has submitted a quotation
      const updatedTenders = (data.data || []).map((tender) => {
        const hasUserQuoted = (tender.quotations || []).some((q) => {
          if (typeof q === 'object' && q.transportUser?._id) {
            return q.transportUser._id === userId
          }
          return false
        })

        return {
          ...tender,
          hasUserQuoted,
        }
      })

      setTenders(updatedTenders);

    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to load tenders.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    fetchTenders()
  }, [])

  const fetchTransporters = async () => {
    try {
      const res = await axios.get(API.FETCH_ALL_TRANSPORTER, {
        withCredentials: true,
      })
      const list = res.data?.data || []
      // console.log("transporter's name : ", res.data)
      setTransporters(list)

      // create a map for quick lookup
      const map = {}
      list.forEach((t) => {
        map[t._id] = t.name
      })
      setTransporterMap(map)
    } catch (err) {
      console.error("Error fetching transporter list:", err)
    }
  }

  // const handleReject = (id) => {
  //   setConfirmDialog({
  //     message: "Are you sure you want to reject this tender?",
  //     onConfirm: () => {
  //       setTenders((prev) => prev.filter((t) => t.id !== id))
  //       toast.info("Tender rejected.")
  //       setConfirmDialog(null)
  //     },
  //     onCancel: () => setConfirmDialog(null),
  //   })
  // }

  const handleApprove = (tender) => {
    setSelectedTender(tender)
    setShowModal(true)
  }

  const handleFileChange = (e) => {
    setResponseForm({
      ...responseForm,
      attachments: e.target.files?.[0] ? [e.target.files[0]] : [],
    })
  }

  const handleResponseChange = (e) => {
    setResponseForm({ ...responseForm, [e.target.name]: e.target.value })
  }

  const handleSubmitResponse = async () => {
    if (!responseForm.price || !responseForm.vehicleNo) {
      toast.warning("Price and vehicle number are required.")
      return
    }

    const formData = new FormData()
    formData.append("price", responseForm.price)
    formData.append("vehicleNumber", responseForm.vehicleNo)

    if (responseForm.attachments.length > 0) {
      formData.append("file", responseForm.attachments[0])
    }

    // console.log([...formData.entries()])
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API.SUBMIT_QUOTATION}/${selectedTender._id}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const result = await res.json()

      if (res.ok) {
        toast.success("Quotation submitted successfully!")

        setHistory((prev) => [
          ...prev,
          {
            rrName: selectedTender.rrName,
            price: responseForm.price,
            vehicleNo: responseForm.vehicleNo,
            attachments: result.data.files?.map((f) => f.originalName || f.url) || [],
            dispatchLocation: selectedTender.dispatchLocation,
            materials: selectedTender.materials.map((m) => ({
              item: m.material,
              subItem: m.subMaterial,
              weight: m.weight,
              quantity: m.quantity,
            })),
          },
        ])

        setShowModal(false)
        setResponseForm({ price: "", vehicleNo: "", attachments: [] })

        // Refresh tender list to reflect quotation
        await fetchTenders()

      } else {
        toast.error(result.message || "Failed to submit quotation.")
      }
    } catch (error) {
      console.error("Quotation Submit Error:", error)
      toast.error("An error occurred while submitting your quotation.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // const handleClearHistory = () => {
  //   setConfirmDialog({
  //     message: "Are you sure you want to delete all history?",
  //     onConfirm: () => {
  //       setHistory([])
  //       toast.info("All history cleared.")
  //       setConfirmDialog(null)
  //     },
  //     onCancel: () => setConfirmDialog(null),
  //   })
  // }

  // const handleDeleteHistoryItem = (index) => {
  //   setConfirmDialog({
  //     message: "Delete this history entry?",
  //     onConfirm: () => {
  //       setHistory((prev) => prev.filter((_, idx) => idx !== index))
  //       toast.success("History entry deleted.")
  //       setConfirmDialog(null)
  //     },
  //     onCancel: () => setConfirmDialog(null),
  //   })
  // }

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
  

  const handleToggleView = async () => {
    if (!view) {
      // Switching to history view
      setHistoryLoading(true)
      setHistoryError(null)
      try {
        await fetchTransporters()
        const res = await axios.get(API.HISTORY_FOR_QUOTATION_QUOTE, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        })

        // console.log("History response:", res.data)

        const enriched = res.data.data.map((entry) => {
          return {
            ...entry,
            transporterName: transporterMap[entry.tenderId] || "Unknown Transporter",
          }
        })

        setHistory(enriched)
      } catch (err) {
        console.error("Failed to load history:", err)
        if (err.response) {
          console.error("Server responded with:", err.response.status, err.response.data)
        } else if (err.request) {
          console.error("No response received:", err.request)
        }
        setHistoryError("Failed to load submission history.")
      } finally {
        setHistoryLoading(false)
      }
    }
    setView((prev) => !prev)
  }

  const navbarActions = (
    <button
      onClick={handleToggleView}
      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
    >
      {view ? (
        <>
          <Package className="h-4 w-4" /> Back to Dashboard
        </>
      ) : (
        <>
          <Clock className="h-4 w-4" /> View History
        </>
      )}
    </button>
  )

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <Navbar
        title="Transporter Dashboard"
        userName={userName || "Transport User"}
        actions={navbarActions}
        onLogout={handleLogout}
      />

      <div className="py-8 px-4 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 text-red-600">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            {error}
          </div>
        ) : view ? (
          historyLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : historyError ? (
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 text-red-600">
              <XCircle className="h-8 w-8 mx-auto mb-2" />
              {historyError}
            </div>
          ) : history.length > 0 ? (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-teal-700 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-teal-600" />
                  Submission History
                </h3>

                {/* <button
                  onClick={handleClearHistory}
                  className=" bg-red-100 flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200">
                  <XCircle className="h-4 w-4" />
                  Clear All
                </button> */}

              </div>
              <div className="grid gap-6">
                {history.map((entry, idx) => (
                  <div
                    key={entry._id || idx}
                    className="relative bg-white border border-slate-200 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md"
                  >
                    {/* Delete Button */}
                    {/* <button
                      onClick={() => handleDeleteHistoryItem(idx)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors duration-200"
                      title="Delete Entry">
                      <XCircle className="h-5 w-5" />
                    </button> */}

                    {/* Header with status badge */}
                    <div className="mb-4 pb-4 border-b border-slate-100 ">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="text-lg font-semibold text-slate-800">Quotation #{idx + 1}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          Submitted
                        </span>
                      </div>
                    </div>

                    {/* Tender Info Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <Home className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">RR User</p>
                          <p className="font-medium text-slate-800">{entry.tender?.createdBy?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">
                            {entry.tender?.createdBy?.email || "Email not available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">Delivery Window</p>
                          <p className="font-medium text-slate-800">
                            {entry.tender?.deliveryWindow?.from && entry.tender?.deliveryWindow?.to
                              ? `${formatDate(entry.tender.deliveryWindow.from)} to ${formatDate(entry.tender.deliveryWindow.to)}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <Clock className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">Closing Date</p>
                          <p className="font-medium text-slate-800">{formatDate(entry.tender?.closeDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <Clock className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">Submitted On</p>
                          <p className="font-medium text-slate-800">
                            {new Date(entry.createdAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">Location</p>
                          <p className="font-medium text-slate-800">{entry.tender?.dispatchLocation || "N/A"}</p>
                          <p className="text-xs text-slate-500">
                            {entry.tender?.address ? `${entry.tender.address}, ` : ""}
                            {entry.tender?.pincode || ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <Truck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">Vehicle Number</p>
                          <p className="font-medium text-slate-800">{entry.vehicleNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <DollarSign className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">Price</p>
                          <p className="font-medium text-slate-800">₹ {entry.price}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <Package className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">Total Weight</p>
                          <p className="font-medium text-slate-800">{entry.tender?.totalWeight ?? "N/A"} kg</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">
                          <Package className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-slate-500">Total Quantity</p>
                          <p className="font-medium text-slate-800">{entry.tender?.totalQuantity ?? "N/A"} pcs</p>
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    {entry.tender?.remarks && (
                      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm">
                        <div className="flex gap-2">
                          <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-amber-800">Remarks:</span> {entry.tender.remarks}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Materials List */}
                    {entry.tender?.materials?.length > 0 && (
                      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <Tool className="h-4 w-4 text-slate-600" /> Materials
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100 text-slate-600">
                                <th className="px-3 py-2 text-left">Material</th>
                                <th className="px-3 py-2 text-left">Sub Item</th>
                                <th className="px-3 py-2 text-right">Weight (Kg)</th>
                                <th className="px-3 py-2 text-right">Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.tender.materials.map((m, i) => (
                                <tr key={m._id || i} className="border-t border-slate-200">
                                  <td className="px-3 py-2 font-medium">{m.material}</td>
                                  <td className="px-3 py-2">{m.subMaterial || "-"}</td>
                                  <td className="px-3 py-2 text-right">{m.weight || "-"}</td>
                                  <td className="px-3 py-2 text-right">{m.quantity || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        <FileUp className="h-4 w-4 text-slate-600" /> Attachments
                      </h4>
                      {entry.files?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {entry.files.map((f, i) => {
                            const label = f.originalName || f.name || `File ${i + 1}`
                            const fileUrl = f.url || f

                            return (
                              <a
                                key={i}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors duration-200 text-sm"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                {label}
                              </a>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No attachments</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 p-8">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No submission history available</p>
              <button
                onClick={handleToggleView}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200"
              >
                Return to Dashboard
              </button>
            </div>
          )
        ) : tenders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 p-8">
            <Package className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No pending tenders available</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-teal-700 mb-6 flex items-center gap-2">
              <Package className="h-6 w-6" />
              Available Tenders
            </h1>

            <div className="space-y-8">
              {tenders.map((tender) => (
                <div
                  key={tender._id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-200 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        Tender from {tender.createdBy?.name || "Unknown RR User"}
                      </h3>
                      <p className="text-sm text-slate-500">{tender.createdBy?.email || "Email not available"}</p>
                    </div>

                    {/* <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Pending Response
                      </span>
                    </div> */}

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tender.hasUserQuoted ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                        {tender.hasUserQuoted ? "Quotation Submitted" : "Pending Response"}
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Delivery Window</p>
                        <p className="font-medium text-slate-800">
                          {tender.deliveryWindow?.from && tender.deliveryWindow?.to
                            ? `${formatDate(tender.deliveryWindow.from)} to ${formatDate(tender.deliveryWindow.to)}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Closing Date</p>
                        <p className="font-medium text-slate-800">{formatDate(tender?.closeDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Location</p>
                        <p className="font-medium text-slate-800">{tender.dispatchLocation || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-sky-100 p-2 rounded-lg text-sky-600">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Address</p>
                        <p className="font-medium text-slate-800">
                          {tender.address || "N/A"}
                          {tender.pincode ? `, ${tender.pincode}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Materials Table */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-3 text-slate-700 flex items-center gap-2">
                      <Tool className="h-5 w-5 text-slate-600" /> Materials
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600">
                            <th className="px-4 py-2 text-left rounded-l-md">Material</th>
                            <th className="px-4 py-2 text-left">Sub Item</th>
                            <th className="px-4 py-2 text-right">Weight (Kg)</th>
                            <th className="px-4 py-2 text-right rounded-r-md">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tender.materials.map((m, index) => (
                            <tr
                              key={m._id}
                              className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition-colors duration-150`}
                            >
                              <td className="px-4 py-2 font-medium">{m.material}</td>
                              <td className="px-4 py-2">{m.subMaterial || "-"}</td>
                              <td className="px-4 py-2 text-right">{m.weight || "-"}</td>
                              <td className="px-4 py-2 text-right">{m.quantity || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="bg-teal-50 border border-teal-100 px-4 py-2 rounded-lg">
                      <span className="text-slate-600 text-sm">Total Weight: </span>
                      <span className="text-teal-700 font-semibold">{tender?.totalWeight ?? "N/A"} kg</span>
                    </div>
                    <div className="bg-teal-50 border border-teal-100 px-4 py-2 rounded-lg">
                      <span className="text-slate-600 text-sm">Total Quantity: </span>
                      <span className="text-teal-700 font-semibold">{tender?.totalQuantity ?? "N/A"} pcs</span>
                    </div>
                  </div>

                  {/* Remarks */}
                  {tender.remarks && (
                    <div className="mb-6 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm">
                      <div className="flex gap-2">
                        <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-amber-800">Remarks:</span> {tender.remarks}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {tender.hasUserQuoted ? (
                    <div className="flex justify-center mt-4 animate-fadeIn">
                      <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-200 rounded-lg shadow-sm">
                        <Award className="h-5 w-5 text-emerald-500" />
                        <span>Quotation Submitted</span>
                        <CheckCheck className="h-5 w-5 text-emerald-500 ml-1" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                      {/* <button
                        onClick={() => handleReject(tender._id)}
                        className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                      >
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span>Reject</span>
                      </button> */}

                      <button
                        onClick={() => handleApprove(tender)}
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quotation Modal */}
      {showModal && selectedTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Submit Quotation
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block font-medium mb-1.5 text-sm text-slate-700">Price (₹)</label>
                <input
                  name="price"
                  value={responseForm.price}
                  onChange={handleResponseChange}
                  type="number"
                  placeholder="Enter your price"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1.5 text-sm text-slate-700">Vehicle Details</label>
                <input
                  name="vehicleNo"
                  value={responseForm.vehicleNo}
                  onChange={handleResponseChange}
                  type="text"
                  placeholder="Enter vehicle details"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1.5 text-sm text-slate-700">Attachments</label>
                <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  <p className="text-xs text-slate-500 mt-2">Upload relevant documents (optional)</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors duration-200 order-1 sm:order-2 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white mr-2"
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
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Quotation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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

export default TransporterDashboardPage
