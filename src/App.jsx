// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import RRDashboard from './pages/RRDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import ProtectedRoute from './utils/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignUpPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Protected Routes */}
        <Route
          path="/rr/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <RRDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute requiredRole="transportUser">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
   
  );
}

export default App;
