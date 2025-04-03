import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import InputField from '../components/InputField';
import { login } from '../utils/UserSlice'; // import your action
import API from '../API';
import axios from 'axios';

const SignInPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
  
    try {
      const res = await axios.post(API.SIGNIN, form); // API.SIGNIN should be defined properly
      const { success, message, data, token } = res?.data || {};
  
      if (success) {
        dispatch(login({
          token,
          role: data.role,
          user: data,
        }));
  
        // Optional: Store token in localStorage for persistent auth
        localStorage.setItem('authToken', token);
  
        // Redirect based on role
        if (data.role === 'user') {
          navigate('/rr/dashboard');
        } else if (data.role === 'transportUser') {
          navigate('/customer/dashboard');
        } else {
          navigate('/signin');
        }
      } else {
        alert(message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      const errMessage = error?.response?.data?.message || 'Something went wrong. Please try again.';
      alert(errMessage);
    } 
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="******"
          />

          <button
            type="submit"
            className={`w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{' '}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
