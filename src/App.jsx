import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import RRDashboardPage from "./pages/RRDashboardPage";
import TransporterDashboardPage from "./pages/TransporterDashboardPage";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { useDispatch, useSelector } from "react-redux";
import API from "./API";
import axios from "axios";
import { login, setAuthChecking } from "./utils/UserSlice";


function App() {
  const dispatch = useDispatch();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { isAuthChecking } = useSelector((state) => state.User);

  useEffect(() => {
    const checkSession = async () => {

      dispatch(setAuthChecking(true));

      try {
        const res = await axios.get(API.CHECK_ME, { withCredentials: true });
        const { data, role } = res.data;
        dispatch(login({ user: data, role }));
      } catch (err) {
        // console.log(err)
        // dispatch(setAuthChecking(false));
        console.log("User not authenticated");
      } finally {
        // setCheckingAuth(false);
        dispatch(setAuthChecking(false));
      }
    };
    checkSession();
  }, [dispatch]);

  // if (checkingAuth) return <div className="text-center mt-10">Checking session...</div>;

  if (isAuthChecking) return <div className="text-center mt-10">Checking session...</div>;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/rr/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <RRDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transporter/dashboard"
        element={
          <ProtectedRoute requiredRole="transportUser">
            <TransporterDashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
