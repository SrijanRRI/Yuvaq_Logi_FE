import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import RRDashboardPage from "./pages/RRDashboardPage";
import TransporterDashboardPage from "./pages/TransporterDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./utils/ProtectedRoute";
import API from "./API";
import { login, setAuthChecking } from "./utils/UserSlice";
import SubscribePage from "./pages/SubscribePage";
import SubscriptionGate from "./utils/SubscriptionGate";

function App() {
  const dispatch = useDispatch();
  const { isAuthChecking } = useSelector((state) => state.User);

  useEffect(() => {
    const checkSession = async () => {
      dispatch(setAuthChecking(true));
      try {
        const res = await axios.get(API.CHECK_ME, { withCredentials: true });
        const { data, role } = res.data;
        dispatch(login({ user: data, role }));
      } catch (err) {
        dispatch(setAuthChecking(false));
        console.log("User not authenticated");
      }
    };
    checkSession();
  }, [dispatch]);

  if (isAuthChecking) return <div className="text-center mt-10">Checking session...</div>;

  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        path="/subscribe"
        element={
          <ProtectedRoute>
            <SubscribePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rr/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <SubscriptionGate>
              <RRDashboardPage />
            </SubscriptionGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/transporter/dashboard"
        element={
          <ProtectedRoute requiredRole="transportUser">
            <SubscriptionGate>
              <TransporterDashboardPage />
            </SubscriptionGate>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
