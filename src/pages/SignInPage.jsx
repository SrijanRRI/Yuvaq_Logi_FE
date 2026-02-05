import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../utils/UserSlice";
import API from "../API";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, Gavel, TrendingDown, CheckCircle2 } from "lucide-react";

const SignInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // const [serverMode, setServerMode] = useState(localStorage.getItem("serverUrl") || "DOMAIN");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, role } = useSelector((state) => state.User);

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
      const { success, message, data } = res?.data || {};

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

  // // Toggle Server Mode
  // const handleServerToggle = () => {
  //   const newMode = serverMode === "DOMAIN" ? "IP" : "DOMAIN";
  //   // console.log(newMode);
  //   setServerMode(newMode);
  //   switchServerUrl(newMode);
  // };

  // useEffect(() => {
  //   const currentHost = window.location.hostname;
  //   // window.location.reload();

  //   if (currentHost === "localhost") {
  //     setServerMode("DOMAIN");
  //     localStorage.setItem("serverUrl", "DOMAIN");
  //   } else {
  //     setServerMode("IP");
  //     localStorage.setItem("serverUrl", "IP");
  //   }
  // }, []);

  // useEffect(() => {
  //     const currentHost = window.location.hostname;
  //     // window.location.reload();

  //     if (currentHost === "reportfe.rrispat.in" ) {
  //         console.log(currentHost);

  //         setServerMode("DOMAIN");
  //         localStorage.setItem("serverUrl", "DOMAIN");
  //     } else {
  //         setServerMode("IP");
  //         localStorage.setItem("serverUrl", "IP");
  //     }
  // }, []);  

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === "user") {
        navigate("/rr/dashboard");
      } else if (role === "transportUser") {
        navigate("/transporter/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      }
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    {/* subtle background accents */}
    <div className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-sky-200/25 blur-3xl" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,118,110,0.08),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(2,132,199,0.06),transparent_60%)]" />

    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-3xl bg-white/80 shadow-[0_18px_55px_rgba(2,6,23,0.10)] ring-1 ring-black/5 backdrop-blur-xl lg:grid-cols-2">
        
        {/* Left brand panel (desktop) */}
        <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-10 text-white">
          <div className="absolute inset-0 opacity-35 [background:radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.25),transparent_45%),radial-gradient(circle_at_78%_65%,rgba(45,212,191,0.18),transparent_55%)]" />

          <div className="relative">

            <h1 className="mt-8 text-3xl font-bold tracking-tight">
              Sign in to continue
            </h1>
            <p className="mt-2 text-white/75 leading-relaxed">
              Manage tenders, review quotations, and finalize{" "}
              <span className="font-semibold text-emerald-200">L1 / L2 / L3</span>{" "}
              rankings with a secure, role-based workflow.
            </p>

            {/* Feature cards */}
            <div className="mt-8 grid gap-3">
              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20 text-emerald-200">
                    <Gavel className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Tender lifecycle</p>
                    <p className="mt-1 text-sm text-white/70">
                      Create → invite → bid → compare → award.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20 text-emerald-200">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Auto ranking</p>
                    <p className="mt-1 text-sm text-white/70">
                      L1, L2, L3 calculated from quotation values.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20 text-emerald-200">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Verified access</p>
                    <p className="mt-1 text-sm text-white/70">
                      Admin, user & transporter workflows supported.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold ring-1 ring-white/10">
                Secure sign-in
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold ring-1 ring-white/10">
                Audit-friendly
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
                Enterprise workflow
              </span>
            </div>
          </div>

          <div className="relative mt-10 text-xs text-white/55">
            © {new Date().getFullYear()} YuvaQ. All rights reserved.
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-r from-emerald-200/30 via-sky-200/20 to-teal-200/20 blur-2xl" />
              <div className="relative rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                {/* Logo badge */}
                <div className="mx-auto w-fit rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-3 shadow-sm ring-1 ring-black/10">
                  <img
                    src="/assets/LogiYatraLogo.png"
                    alt="Company Logo"
                    className="h-14 w-auto object-contain sm:h-16 drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Sign in
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Reverse Auction System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="pl-10 w-full py-3 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none transition
                             focus:ring-2 focus:ring-slate-300 focus:border-slate-500
                             hover:border-slate-300"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 w-full py-3 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none transition
                             focus:ring-2 focus:ring-slate-300 focus:border-slate-500
                             hover:border-slate-300"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 rounded-xl p-1.5 text-slate-500 transition hover:bg-slate-100 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <span
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer transition"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-2xl font-semibold shadow-md flex items-center justify-center transition
                bg-slate-900 text-white hover:bg-slate-800 active:translate-y-[1px]
                focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2
                ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
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

            {/* optional subtle note */}
            <p className="text-center text-xs text-slate-500">
              Your account may require admin approval before accessing bidding.
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-slate-700">
              Don't have an account?{" "}
              <span
                className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </span>
            </p>

            <p className="mt-6 text-center text-xs text-slate-500 lg:hidden">
              © {new Date().getFullYear()} YuvaQ. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default SignInPage;
