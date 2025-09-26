import React, { useState } from 'react';
import InputField from '../components/InputField';
import UserToggle from '../components/UserToggle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../API';
import { toast } from 'react-toastify';

const SignUpPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', gstn: '', password: '', confirmPassword: '' });
  const [userType, setUserType] = useState('Transporter'); // 'Transporter' | 'RR User'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // India GSTIN pattern
  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  const isTransporter = userType === 'Transporter';

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setForm((f) => ({ ...f, [name]: digitsOnly }));
      return;
    }

    if (name === 'gstn') {
      const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
      setForm((f) => ({ ...f, gstn: clean }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const getRoleFromUserType = (type) => {
    if (type === 'Transporter') return 'transportUser';
    return 'user'; // RR User
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    // GSTN validation ONLY for Transporters
    if (isTransporter) {
      if (!form.gstn) {
        toast.error("GST Number is required for Transport users.");
        return;
      }
      if (!GSTIN_REGEX.test(form.gstn)) {
        toast.error("Please enter a valid 15-character GST Number (GSTIN).");
        return;
      }
    }

    const role = getRoleFromUserType(userType);

    // Build payload; omit gstn for RR User
    const payload = {
      name: form.name,
      email: form.email.toLowerCase().trim(),
      phone: `91${form.phone.trim()}`,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role,
      ...(isTransporter ? { gstn: form.gstn } : {}), // only include for transporters
    };

    try {
      setLoading(true);
      const res = await axios.post(`${API.SIGNUP}`, payload);

      if (res.data.success) {
        toast.success("Signup successful! Please sign in.");
        navigate('/signin');
      } else {
        toast.error(res.data.message || "Signup failed. Try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic labels for RR User vs Transporter
  const nameLabel = isTransporter ? "Full Company Name" : "Name";
  const emailLabel = isTransporter ? "Company Email" : "Email";
  const phoneLabel = isTransporter ? "Whatsapp Phone Number" : "Phone Number";
  const phonePlaceholder = isTransporter ? "10-digit mobile number" : "10-digit phone number";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        {/* Logo */}
        <div className="flex justify-center ">
          <div className="w-60 h-24 flex items-center justify-center ">
            <img
              src="/assets/LogiYatraLogo.png"
              alt="Company Logo"
              className="w-60 h-28 object-contain"
            />
          </div>
        </div>

        <p className="text-center text-gray-500 mb-6">Join us and start your journey</p>

        <UserToggle userType={userType} setUserType={setUserType} />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField
            label={nameLabel}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={isTransporter ? "Company Name" : "Your Name"}
            className="focus:ring-red-700 focus:border-red-800"
          />

          <InputField
            label={emailLabel}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="johndoe@example.com"
            className="focus:ring-red-700 focus:border-red-800"
          />

          <InputField
            label={phoneLabel}
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            maxLength={10}
            inputMode="numeric"
            placeholder={phonePlaceholder}
            className="focus:ring-red-700 focus:border-red-800"
          />

          {/* GST Number — ONLY for Transporters */}
          {isTransporter && (
            <InputField
              label="GST Number"
              name="gstn"
              type="text"
              value={form.gstn}
              onChange={handleChange}
              placeholder="15-character GSTIN (e.g., 27ABCDE1234F1Z5)"
              maxLength={15}
              autoCapitalize="characters"
              autoComplete="off"
              title="Format: 2 digits (state) + 10-char PAN + 1 entity code + Z + 1 check"
              className="focus:ring-red-700 focus:border-red-800"
              // don't use HTML required; we handle it conditionally in JS
            />
          )}

          <InputField
            label="Set Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="******"
            className="focus:ring-red-700 focus:border-red-800"
          />
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="******"
            className="focus:ring-red-700 focus:border-red-800"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-8 py-3 bg-[#c4000e] text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ' hover:shadow-md'}`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 border-4 border-t-transparent border-white rounded-full"
                  viewBox="0 0 24 24"
                />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <span
              className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer transition-colors"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </span>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
