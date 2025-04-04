// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import RRDashboardPage from './pages/RRDashboardPage';
import TransporterDashboardPage from './pages/TransporterDashboardPage';
import ProtectedRoute from './utils/ProtectedRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignUpPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />

        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage/>} />
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
