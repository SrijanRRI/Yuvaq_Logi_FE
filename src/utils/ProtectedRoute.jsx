import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({
  requiredRole = null,
  redirect = "/signin",
  children,
}) {
  const { isAuthenticated, role, isAuthChecking } = useSelector((s) => s.User);
  const location = useLocation();

  if (isAuthChecking) {
    return <div className="text-center mt-10">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirect} replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={redirect} replace />;
  }

  return children ? children : <Outlet />;
}