// src/utils/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ requiredRole = null, redirect = "/signin", children }) => {
  const { isAuthenticated, role, isAuthChecking } = useSelector((state) => state.User);

  if (isAuthChecking) {
    return <div className="text-center mt-10">Checking session...</div>;
  }

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return <Navigate to={redirect} />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
