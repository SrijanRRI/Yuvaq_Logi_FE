import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import InputField from "../components/InputField";
import { login } from "../utils/UserSlice";
import API from "../API";
import axios from "axios";

const SignInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(API.SIGNIN, form);
      const { success, message, data, token } = res?.data || {};

      if (success) {
        dispatch(
          login({
            token,
            role: data.role,
            user: data,
          })
        );

        localStorage.setItem("authToken", token);

        if (data.role === "user") {
          navigate("/rr/dashboard");
        } else if (data.role === "transportUser") {
          navigate("/customer/dashboard");
        } else if (data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/signin");
        }
      } else {
        alert(message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errMessage =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
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

          {/* Forgot Password Link */}
          <div className="text-right mt-2">
            <span
              className="text-sm text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            className={`w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
