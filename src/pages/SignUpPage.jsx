import React, { useState } from 'react';
import InputField from '../components/InputField';
import UserToggle from '../components/UserToggle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../API';
import { toast } from 'react-toastify';

const SignUpPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [userType, setUserType] = useState('Transporter'); // UI toggle state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const handleChange = (e) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // Allow only digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, [name]: digitsOnly });
    } else {
      setForm({ ...form, [name]: value });
    }
  };


  const getRoleFromUserType = (type) => {
    if (type === 'Transporter') return 'transportUser';
    return 'user'; // Default RR user
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

    const role = getRoleFromUserType(userType);

    const payload = {
      name: form.name,
      email: form.email.toLowerCase().trim(),
      phone: `91${form.phone.trim()}`,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role,
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
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        {/* Logo Section */}
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
            label="Full Company Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Company Name"
            className="focus:ring-red-700 focus:border-red-800"
          />
          <InputField
            label="Company Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="johndoe@example.com"
            className="focus:ring-red-700 focus:border-red-800"
          />
          <InputField
            label="Whatsapp Phone Number"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            maxLength={10}
            inputMode="numeric"
            placeholder="10-digit mobile number"
            className="focus:ring-red-700 focus:border-red-800"
          />
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