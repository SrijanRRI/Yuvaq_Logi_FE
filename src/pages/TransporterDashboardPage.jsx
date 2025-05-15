import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import axios from "axios"
import API from "../API"
import { logout } from "../utils/UserSlice"
import {
  Package,
  XCircle,
  Clock,
  Calendar,
  History,
  LogOut,
  Bell,
  User,
  ChevronDown,
  Search,
  Truck,
  BarChart4,
} from "lucide-react"
import UpcomingTenders from "./TransportersPages/UpcomingTenders"
import LiveBidding from "./TransportersPages/LiveBidding"
import HistoryView from "./TransportersPages/HistoryView"
import Logo from "/assets/LogiYatraIcon1.png"

const TransporterDashboardPage = () => {
  const [view, setView] = useState("all")
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)


  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userInfo = useSelector((state) => state.User?.userInfo)
  const userName = userInfo?.name || "Transporter"

  const fetchLiveBidingTenders = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(API.LIVE_BIDING_TENDERS, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      setTenders(res.data.data || [])
    } catch (err) {
      console.error("Error fetching live biding tenders:", err)
      setError("Failed to load tenders.")
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingTenders = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(API.UPCOMING_TENDERS, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      setTenders(res.data.data || [])
    } catch (err) {
      console.error("Error fetching all tenders:", err)
      setError("Failed to load tenders.")
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(API.HISTORY_FOR_QUOTATION_QUOTE, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      setTenders(res.data.data || [])
    } catch (err) {
      console.error("Error fetching history:", err)
      setError("Failed to load history.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUpcomingTenders()
  }, [])

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

  const handleViewChange = (newView) => {
    setView(newView)
    if (newView === "live") fetchLiveBidingTenders()
    else if (newView === "history") fetchHistory()
    else if (newView === "all") fetchUpcomingTenders()
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Modern Navbar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={Logo} 
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800"> Transporter Dashboard </h1>
                <p className="text-xs text-slate-500">Manage your Bids and Quotations</p>
              </div>
            </div>

            {/* User Menu and Notifications */}
            <div className="flex items-center gap-2">

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-200">
                      <p className="font-medium text-slate-800">{userName}</p>
                      <p className="text-xs text-slate-500">Transporter</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

        {/* View Selector */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-2 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleViewChange("all")}
              className={`flex-1 px-5 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${view === "all"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Calendar className={`w-5 h-5 ${view === "all" ? "text-white" : "text-teal-500"}`} />
              <span className="font-medium">Upcoming Tenders</span>
            </button>
            <button
              onClick={() => handleViewChange("live")}
              className={`flex-1 px-5 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${view === "live"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Clock className={`w-5 h-5 ${view === "live" ? "text-white" : "text-teal-500"}`} />
              <span className="font-medium">Live Bidding</span>
            </button>
            <button
              onClick={() => handleViewChange("history")}
              className={`flex-1 px-5 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${view === "history"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
            >
              <History className={`w-5 h-5 ${view === "history" ? "text-white" : "text-teal-500"}`} />
              <span className="font-medium">History</span>
            </button>
          </div>
        </div>



        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading data...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait while we fetch the latest information</p>
          </div>
        ) : error ? (
          <div className="text-center p-10 bg-white rounded-xl border border-red-200 text-red-600 shadow-md">
            <div className="bg-red-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="font-medium text-lg mb-2">{error}</p>
            <p className="text-slate-500 mb-6">We couldn't load the data you requested. Please try again.</p>
            <button
              onClick={() => handleViewChange(view)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        ) : tenders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center shadow-md">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Data Available</h3>
            <p className="text-slate-500 max-w-md mb-6">
              There are currently no{" "}
              {view === "all" ? "upcoming tenders" : view === "live" ? "live bidding sessions" : "historical records"}{" "}
              to display.
            </p>
            {view !== "all" && (
              <button
                onClick={() => handleViewChange("all")}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-colors shadow-md"
              >
                View Upcoming Tenders
              </button>
            )}
          </div>
        ) : view === "all" ? (
          <UpcomingTenders tenders={tenders} />
        ) : view === "live" ? (
          <LiveBidding tenders={tenders} />
        ) : view === "history" ? (
          <HistoryView tenders={tenders} />
        ) : null}
      </div>


    </div>
  )
}

export default TransporterDashboardPage
