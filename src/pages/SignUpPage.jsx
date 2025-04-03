// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import InputField from '../components/InputField';
import UserToggle from '../components/UserToggle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../API';

const SignUpPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [userType, setUserType] = useState('RR'); // UI toggle state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getRoleFromUserType = (type) => {
    if (type === 'Customer') return 'transportUser';
    return 'user'; // Default RR user
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const role = getRoleFromUserType(userType);
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      confirmPassword:form.confirmPassword,
      role,
    };

    try {
      setLoading(true);

      const res = await axios.post(`${API.SIGNUP}`, payload); 

      if (res.data.success) {
        alert("Signup successful! Please sign in.");
        navigate('/signin');
      } else {
        alert(res.data.message || "Signup failed. Try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

        <UserToggle userType={userType} setUserType={setUserType} />

        <form onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="johndoe@example.com"
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="******"
          />
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="******"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2 bg-blue-600 text-white rounded-lg transition ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
