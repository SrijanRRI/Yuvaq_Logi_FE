import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { login } from "../utils/UserSlice";
import API from "../API";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const SignInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      email: form.email.toLowerCase().trim(),
    };

    try {
      const res = await axios.post(API.SIGNIN, payload, {
        withCredentials: true,
      });
      const { success, message, data, token } = res?.data || {};

      if (success) {
        dispatch(
          login({
            role: data.role,
            user: data,
          })
        );

     

        toast.success("Login successful!");

        if (data.role === "user") {
          navigate("/rr/dashboard");
        } else if (data.role === "transportUser") {
          navigate("/transporter/dashboard");
        } else if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/signin");
        }
      } else {
        toast.error(message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errMessage =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <div className="w-60 h-24 flex items-center justify-center ">
            <img
              src="/assets/LogiYatraLogo.png"
              alt="Company Logo"
              className="w-60 h-28 object-contain"
            />
          </div>
          
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="pl-10 w-full py-2.5 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pl-10 w-full py-2.5 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            {/* <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div> */}
            <div>
              <span
                className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 bg-[#ca000e] text-white rounded-lg  transition duration-200 font-medium shadow-md flex items-center justify-center ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 border-2 border-t-transparent border-white rounded-full"
                  viewBox="0 0 24 24"
                />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <span
              className="text-blue-600 font-medium hover:underline cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
