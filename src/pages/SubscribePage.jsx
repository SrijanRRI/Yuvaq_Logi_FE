// src/pages/SubscribePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  Crown,
  ShieldCheck,
  Loader2,
  LogOut,
  ArrowLeft,
  User,
} from "lucide-react";

import API from "../API";
import {
  logout,
  setSubscription,
  setSubscriptionChecking,
} from "../utils/UserSlice";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const authCfg = () => {
  const token = localStorage.getItem("session_token");
  return {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

// ✅ derive plans URL from your SUBSCRIPTION_ME constant
const getPlansUrl = () => {
  if (API.SUBSCRIPTION_PLANS) return API.SUBSCRIPTION_PLANS;
  if (API.SUBSCRIPTION_ME)
    return API.SUBSCRIPTION_ME.replace(/\/me$/, "/plans");
  return "/subscriptions/plans";
};

export default function SubscribePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { role, userInfo, subscription, subscriptionLoaded } = useSelector(
    (s) => s.User
  );

  const userName = userInfo?.name || "User";

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [payingPlan, setPayingPlan] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fromPath = location.state?.from || null;

  const dashboardPath = useMemo(() => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "transportUser") return "/transporter/dashboard";
    return "/rr/dashboard";
  }, [role]);

  const refreshSubscription = async () => {
    dispatch(setSubscriptionChecking(true));
    try {
      const res = await axios.get(API.SUBSCRIPTION_ME, authCfg());
      const payload = res?.data?.data;

      const isActive = !!payload?.isActive;
      const sub = payload?.subscription || { status: "none" };

      dispatch(
        setSubscription({
          isActive,
          subscription: sub,
        })
      );

      return isActive;
    } catch (e) {
      dispatch(
        setSubscription({
          isActive: false,
          subscription: { status: "none" },
        })
      );
      return false;
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call backend logout (clears cookie)
      await axios.post(API.LOGOUT_USER, {}, { withCredentials: true });

      // Clear redux + local tokens (optional)
      localStorage.removeItem("session_token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");

      dispatch(logout());
      toast.success("Logged out");
      navigate("/signin", { replace: true });
    } catch (e) {
      // even if API fails, still clear client state
      localStorage.removeItem("session_token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");

      dispatch(logout());
      toast.info("Logged out");
      navigate("/signin", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleGoBack = () => {
    // If user came from a route, go there; else go to role dashboard
    navigate(fromPath || dashboardPath, { replace: true });
  };

  // ✅ if already subscribed, redirect away from subscribe page
  useEffect(() => {
    if (role === "admin") {
      navigate(dashboardPath, { replace: true });
      return;
    }
    if (subscriptionLoaded && subscription?.isActive) {
      navigate(fromPath || dashboardPath, { replace: true });
    }
  }, [
    subscriptionLoaded,
    subscription?.isActive,
    role,
    navigate,
    dashboardPath,
    fromPath,
  ]);

  // ✅ load plans from backend (/subscriptions/plans)
  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await axios.get(getPlansUrl(), {
          headers: { "Content-Type": "application/json" },
        });
        const list = res?.data?.plans || [];

        const normalized = list.map((p) => ({
          plan: p.plan, // "monthly" | "yearly"
          label: p.label || (p.plan === "monthly" ? "Monthly" : "Yearly"),
          amountInr: Number(p.amountInr || 0),
          priceLabel: p.amountInr
            ? `₹${Number(p.amountInr).toLocaleString("en-IN")}`
            : "Contact Admin",
          features:
            p.plan === "monthly"
              ? [
                  "Access tenders & bidding",
                  "Post-bid participation",
                  "Standard support",
                ]
              : ["Everything in Monthly", "Best value", "Priority support"],
          recommended: p.plan === "yearly",
        }));

        setPlans(normalized.length ? normalized : []);
      } catch (e) {
        // fallback if plans call fails
        setPlans([
          {
            plan: "monthly",
            label: "Monthly",
            amountInr: 0,
            priceLabel: "Contact Admin",
            features: ["Access tenders & bidding", "Post-bid participation"],
            recommended: false,
          },
          {
            plan: "yearly",
            label: "Yearly",
            amountInr: 0,
            priceLabel: "Contact Admin",
            features: ["Everything in Monthly", "Best value"],
            recommended: true,
          },
        ]);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const startPayment = async (planObj) => {
    const plan = planObj?.plan; // "monthly" | "yearly"
    if (!plan) return;

    setPayingPlan(plan);

    try {
      const sdkOk = await loadRazorpayScript();
      if (!sdkOk) {
        toast.error("Razorpay SDK failed to load. Please try again.");
        return;
      }

      // ✅ backend expects { plan }
      const orderRes = await axios.post(
        API.SUBSCRIPTION_CREATE_ORDER,
        { plan },
        authCfg()
      );

      const data = orderRes?.data || {};

      // if already active
      if (data.alreadyActive) {
        toast.info("Subscription already active.");
        const active = await refreshSubscription();
        if (active) navigate(fromPath || dashboardPath, { replace: true });
        return;
      }

      const keyId = data.keyId;
      const orderId = data.orderId;
      const amount = data.amount; // paise
      const currency = data.currency || "INR";

      if (!keyId || !orderId) {
        toast.error("Order creation failed (missing keyId/orderId).");
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Reverse Auction System",
        description: `Subscription (${plan})`,
        order_id: orderId,
        prefill: {
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          contact: userInfo?.phone || "",
        },
        theme: { color: "#0f172a" },
        handler: async (response) => {
          try {
            // ✅ backend expects { plan, razorpay_* }
            const verifyRes = await axios.post(
              API.SUBSCRIPTION_VERIFY,
              {
                plan,
                razorpay_order_id: response?.razorpay_order_id,
                razorpay_payment_id: response?.razorpay_payment_id,
                razorpay_signature: response?.razorpay_signature,
              },
              authCfg()
            );

            if (verifyRes?.data?.success) {
              toast.success("Subscription activated!");
              const active = await refreshSubscription();
              if (active) navigate(fromPath || dashboardPath, { replace: true });
              else
                toast.warn(
                  "Payment verified but subscription still inactive. Refresh once."
                );
            } else {
              toast.error(verifyRes?.data?.message || "Verification failed.");
            }
          } catch (e) {
            toast.error(
              e?.response?.data?.message || "Payment verification failed."
            );
          }
        },
        modal: {
          ondismiss: () => toast.info("Payment cancelled."),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not start payment.");
    } finally {
      setPayingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-sky-200/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Top actions (Responsive) */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Back */}
          <button
            onClick={handleGoBack}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          {/* User + Logout */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-black/5 backdrop-blur sm:w-auto">
              <User className="h-4 w-4 text-slate-500" />
              <span className="max-w-[16rem] truncate">{userName}</span>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition sm:w-auto ${
                loggingOut ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow">
            <Crown className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Activate Subscription
          </h1>
          <p className="mt-2 text-slate-600">
            Subscription is required to access bidding and dashboards.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 grid gap-6 md:grid-cols-2">
          {loadingPlans ? (
            <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white/80 p-8 sm:p-10 text-center shadow-sm">
              <div className="mx-auto flex w-fit items-center gap-2 text-slate-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading plans...
              </div>
            </div>
          ) : (
            plans.map((p) => (
              <div
                key={p.plan}
                className={`relative overflow-hidden rounded-3xl border bg-white/80 p-6 sm:p-7 shadow-sm ring-1 ring-black/5 backdrop-blur ${
                  p.recommended ? "border-emerald-200" : "border-slate-200"
                }`}
              >
                {p.recommended && (
                  <div className="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
                    Recommended
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{p.label}</h2>
                    <p className="mt-1 text-slate-600">{p.priceLabel}</p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      p.recommended
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {p.features.map((f, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => startPayment(p)}
                  disabled={!!payingPlan}
                  className={`mt-7 w-full rounded-2xl px-5 py-3 font-semibold shadow-md transition ${
                    p.recommended
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  } ${payingPlan ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {payingPlan === p.plan ? "Opening payment..." : "Buy Subscription"}
                </button>

                <p className="mt-3 text-xs text-slate-500">
                  Secure payment via Razorpay
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 sm:mt-10 rounded-3xl border border-slate-200 bg-white/70 p-5 sm:p-6 text-sm text-slate-700 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-slate-900">Already paid?</div>
              <div className="text-slate-600">Refresh your subscription status.</div>
            </div>

            <button
              onClick={async () => {
                const active = await refreshSubscription();
                if (active) navigate(fromPath || dashboardPath, { replace: true });
                else toast.info("Subscription still inactive.");
              }}
              className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50 transition"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}