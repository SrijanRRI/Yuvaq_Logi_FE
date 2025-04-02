import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import RRDashboard from './pages/RRDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={`Home Page`} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />

        <Route path="/rr/dashboard" element={<RRDashboard />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
