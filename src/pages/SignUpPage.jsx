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

              {/* Product name */}
              <h1 className="mt-5 text-3xl font-bold tracking-tight">
                Reverse Auction System
              </h1>

              <p className="mt-2 text-sm font-semibold text-white/80">
                Create your account to start bidding or managing tenders.
              </p>

              <p className="mt-4 text-white/75 leading-relaxed">
                Join a secure platform where{" "}
                <span className="font-semibold text-white">Transporters</span> submit quotations and{" "}
                <span className="font-semibold text-white">Users</span> create tenders, compare bids, and finalize{" "}
                <span className="font-semibold text-emerald-200">L1 / L2 / L3</span> rankings with clarity.
              </p>

              {/* Badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold ring-1 ring-white/10">
                  Verified participants
                </span>
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold ring-1 ring-white/10">
                  Audit-friendly workflow
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
                  Two-step admin approval
                </span>
              </div>

              {/* Value cards */}
              <div className="mt-8 grid gap-3">
                <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">For Transporters</p>
                  <p className="mt-1 text-sm text-white/70">
                    Access approved tenders, submit competitive quotations, and win work based on value + compliance.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">For Users (Tender Creators)</p>
                  <p className="mt-1 text-sm text-white/70">
                    Create tenders, invite bids, compare quotes fast, and finalize awarding decisions confidently.
                  </p>
                </div>
              </div>

              {/* Onboarding stepper */}
              <div className="mt-8 rounded-2xl bg-white/6 p-5 ring-1 ring-white/10 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">How onboarding works</p>
                <p className="mt-1 text-sm text-white/70">
                  To keep the bidding environment clean and trusted, every account is activated only after verification.
                </p>

                <div className="mt-4 grid gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Sign up</p>
                      <p className="mt-0.5 text-sm text-white/70">
                        Register as Transporter or User (GSTIN required for Transporters).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Two-step admin approvals</p>
                      <p className="mt-0.5 text-sm text-white/70">
                        Your profile goes through <span className="font-semibold text-white">two approvals</span> before access is enabled.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Start bidding / managing tenders</p>
                      <p className="mt-0.5 text-sm text-white/70">
                        Transporters can bid; Users can create tenders and evaluate quotations for awarding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm text-white/70">
                Create your account now — you’ll be notified once approvals are completed.
              </p>
            </div>

            <div className="relative mt-10 text-xs text-white/55">
              © {new Date().getFullYear()} YuvaQ. All rights reserved.
            </div>
          </div>

          {/* Right form panel */}
          <div className="p-6 sm:p-10">
            {/* Header */}
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-r from-emerald-200/30 via-sky-200/20 to-teal-200/20 blur-2xl" />
                <div className="relative rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
                  {/* Logo badge (same as SignIn professional) */}
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
                Create Account
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Tender Management System
              </p>
            </div>

            {/* Toggle container */}
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
              <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
                Select account type
              </div>

              <UserToggle userType={userType} setUserType={setUserType} />

              <div className="mt-3 text-xs text-slate-600">
                {isTransporter
                  ? "Transporters require GSTIN for bidding and compliance."
                  : "Users can create tenders and evaluate quotations."}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <InputField
                label={nameLabel}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={isTransporter ? "GST Registration Name" : "Your Name"}
                className="focus:ring-emerald-200 focus:border-emerald-300"
              />

              <InputField
                label={emailLabel}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="johndoe@example.com"
                className="focus:ring-emerald-200 focus:border-emerald-300"
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
                className="focus:ring-emerald-200 focus:border-emerald-300"
              />

              {/* GST Number — ONLY for Transporters */}
              {isTransporter && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="mb-2 text-xs font-semibold text-emerald-900/80">
                    GSTIN required for Transporters
                  </div>
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
                    className="focus:ring-emerald-200 focus:border-emerald-300"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Set Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="******"
                  className="focus:ring-emerald-200 focus:border-emerald-300"
                />
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="******"
                  className="focus:ring-emerald-200 focus:border-emerald-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-2 py-3 rounded-2xl font-semibold shadow-md flex items-center justify-center gap-2 transition
                bg-slate-900 text-white hover:bg-slate-800 active:translate-y-[1px]
                focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2
                ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
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

              {/* approval info (UI text only) */}
              <p className="text-center text-xs text-slate-500">
                After signup, admin will complete a two-step approval before your account can participate.
              </p>
            </form>

            <div className="mt-7 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-700">
                Already have an account?{" "}
                <span
                  className="text-emerald-700 font-semibold hover:underline cursor-pointer transition-colors"
                  onClick={() => navigate("/signin")}
                >
                  Sign In
                </span>
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                <p className="text-xs text-slate-600">
                  By signing up, you agree to our{" "}
                  <span className="font-semibold text-slate-800">Terms of Service</span>{" "}
                  and{" "}
                  <span className="font-semibold text-slate-800">Privacy Policy</span>.
                </p>
              </div>

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

export default SignUpPage;
