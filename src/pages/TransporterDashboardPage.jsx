import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import axios from "axios"
import API from "../API"
import { logout } from "../utils/UserSlice"
import Navbar from "../components/Navbar"
import { Package, XCircle, Clock, Calendar, History } from "lucide-react"
import UpcomingTenders from "./TransportersPages/UpcomingTenders"
import LiveBidding from "./TransportersPages/LiveBidding"
import HistoryView from "./TransportersPages/HistoryView"

const TransporterDashboardPage = () => {
  const [view, setView] = useState("all")
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userInfo = useSelector((state) => state.User?.userInfo)
  const userName = userInfo?.name || "RR User"

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
      // console.log("upcoming tenders :" , res.data);
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
      // console.log("Fetch history of the Transporter : ", res.data.data)
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      <Navbar title="Transporter Dashboard" userName={userName} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={() => handleViewChange("all")}
            className={`px-5 py-2.5 rounded-lg shadow-sm border transition-all duration-200 flex items-center justify-center gap-2 ${
              view === "all"
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white border-teal-700"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <Calendar className={`w-4 h-4 ${view === "all" ? "text-teal-200" : "text-teal-500"}`} />
            <span>Upcoming Tenders</span>
          </button>
          <button
            onClick={() => handleViewChange("live")}
            className={`px-5 py-2.5 rounded-lg shadow-sm border transition-all duration-200 flex items-center justify-center gap-2 ${
              view === "live"
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white border-teal-700"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <Clock className={`w-4 h-4 ${view === "live" ? "text-teal-200" : "text-teal-500"}`} />
            <span>Live Bidding</span>
          </button>
          <button
            onClick={() => handleViewChange("history")}
            className={`px-5 py-2.5 rounded-lg shadow-sm border transition-all duration-200 flex items-center justify-center gap-2 ${
              view === "history"
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white border-teal-700"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <History className={`w-4 h-4 ${view === "history" ? "text-teal-200" : "text-teal-500"}`} />
            <span>History</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-slate-600">Loading data...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 text-red-600 shadow-sm">
            <XCircle className="h-10 w-10 mx-auto mb-3" />
            <p className="font-medium">{error}</p>
            <button
              onClick={() => handleViewChange(view)}
              className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-md text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : tenders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center shadow-sm">
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
                className="px-4 py-2 bg-teal-50 border border-teal-200 rounded-md text-teal-600 hover:bg-teal-100 transition-colors"
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
