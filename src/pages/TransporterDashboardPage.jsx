import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import API from "../API";
import { logout } from "../utils/UserSlice";
import {
  Package,
  XCircle,
  Clock,
  Calendar,
  History,
  Bell,
  BarChart4,
  ArrowLeft,
} from "lucide-react";

import UpcomingTenders from "./TransportersPages/UpcomingTenders";
import LiveBidding from "./TransportersPages/LiveBidding";
import HistoryView from "./TransportersPages/HistoryView";
import Navbar from "../components/Navbar";
import PendingConfirmationsView from "./TransportersPages/PendingConfirmationsView";
import PostBidNegotiationsView from "./TransportersPages/PostBidNegotiationsView";
import ProfileSection from "./ProfileSection";


const TransporterDashboardPage = () => {
  const [view, setView] = useState("all");
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.User?.userInfo);
  const userName = userInfo?.name || "Transporter";

  const [pendingReqs, setPendingReqs] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [postBidTenders, setPostBidTenders] = useState([]);
  const [postBidLoading, setPostBidLoading] = useState(false);

  const authCfg = () => {
    const token = localStorage.getItem("session_token");
    return {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  };

  const fetchLiveBidingTenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API.LIVE_BIDING_TENDERS, authCfg());
      setTenders(res?.data?.data || []);
      console.log("live bidding", res?.data?.data);
    } catch (err) {
      console.error("Error fetching live biding tenders:", err);
      setError("Failed to load tenders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingTenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API.UPCOMING_TENDERS, authCfg());
      setTenders(res?.data?.data || []);
      console.log("upcoming bidding", res?.data?.data);
    } catch (err) {
      console.error("Error fetching all tenders:", err);
      setError("Failed to load tenders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API.HISTORY_FOR_QUOTATION_QUOTE, authCfg());
      setTenders(res?.data?.data || []);
      console.log("fetch history", res?.data?.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingConfirmations = async () => {
    setPendingLoading(true);
    try {
      const res = await axios.get(API.PENDING_CONFIRMATIONS_TRANSPORTER, authCfg());
      setPendingReqs(res?.data?.data || res?.data || []);
      console.log("responses", res?.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not load pending confirmations.");
      setPendingReqs([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchActivePostBidTenders = async () => {
    setPostBidLoading(true);
    try {
      const res = await axios.get(API.ACTIVE_POST_BID_TENDERS, authCfg());
      setPostBidTenders(res?.data?.data || []);
      console.log("start", res?.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not load post-bid tenders.");
      setPostBidTenders([]);
    } finally {
      setPostBidLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingTenders();
    fetchPendingConfirmations();
    fetchActivePostBidTenders();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(API.LOGOUT_USER, {}, authCfg());
      dispatch(logout());
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
    } finally {
      navigate("/signin");
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);

    if (newView === "live") fetchLiveBidingTenders();
    else if (newView === "history") fetchHistory();
    else if (newView === "confirmations") fetchPendingConfirmations();
    else if (newView === "postBid") fetchActivePostBidTenders();
    else if (newView === "all") fetchUpcomingTenders();
  };

  const BackToDashboardButton =
    view === "profile" ? (
      <button
        onClick={() => handleViewChange("all")}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </button>
    ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar
        title="Transporter Dashboard"
        userName={userName}
        onLogout={handleLogout}
        onProfileClick={() => setView("profile")}
        actions={[BackToDashboardButton].filter(Boolean)}
      />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        {view !== "profile" && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-2 mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleViewChange("all")}
                className={`flex-1 px-5 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  view === "all"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Calendar className={`w-5 h-5 ${view === "all" ? "text-white" : "text-teal-500"}`} />
                <span className="font-medium">Upcoming Tenders</span>
              </button>

              <button
                onClick={() => handleViewChange("live")}
                className={`flex-1 px-5 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  view === "live"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Clock className={`w-5 h-5 ${view === "live" ? "text-white" : "text-teal-500"}`} />
                <span className="font-medium">Live Bidding</span>
              </button>

              <button
                onClick={() => handleViewChange("postBid")}
                className={`flex-1 px-5 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 relative ${
                  view === "postBid"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <BarChart4 className={`w-5 h-5 ${view === "postBid" ? "text-white" : "text-teal-500"}`} />
                <span className="font-medium">Post-Bid</span>

                {postBidTenders?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {postBidTenders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleViewChange("history")}
                className={`flex-1 px-5 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  view === "history"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <History className={`w-5 h-5 ${view === "history" ? "text-white" : "text-teal-500"}`} />
                <span className="font-medium">History</span>
              </button>

              <button
                onClick={() => handleViewChange("confirmations")}
                className={`flex-1 px-5 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 relative ${
                  view === "confirmations"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bell className={`w-5 h-5 ${view === "confirmations" ? "text-white" : "text-teal-500"}`} />
                <span className="font-medium">Confirmations</span>

                {pendingReqs?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingReqs.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {view === "profile" ? (
          <ProfileSection fallbackUser={userInfo} />
        ) : view === "postBid" ? (
          <PostBidNegotiationsView
            items={postBidTenders}
            loading={postBidLoading}
            onRefresh={fetchActivePostBidTenders}
          />
        ) : view === "confirmations" ? (
          <PendingConfirmationsView
            items={pendingReqs}
            loading={pendingLoading}
            onRefresh={fetchPendingConfirmations}
          />
        ) : loading ? (
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
          <HistoryView tenders={tenders} onRefresh={fetchHistory} />
        ) : null}
      </div>
    </div>
  );
};

export default TransporterDashboardPage;