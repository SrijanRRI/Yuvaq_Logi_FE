// src/utils/SubscriptionGate.jsx
import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import API from "../API";
import { setSubscription, setSubscriptionChecking } from "../utils/UserSlice";

const PAY_ROLES = ["user", "transportUser"];

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

export default function SubscriptionGate({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    isAuthenticated,
    role,
    subscription,
    subscriptionLoaded,
    isSubscriptionChecking,
  } = useSelector((s) => s.User);

  const ranOnceRef = useRef(false);

  const shouldRequire =
    isAuthenticated && role && role !== "admin" && PAY_ROLES.includes(role);

  useEffect(() => {
    if (!shouldRequire) return;
    if (subscriptionLoaded || isSubscriptionChecking) return;

    // ✅ prevents React 18 StrictMode double-invoke + remount loops
    if (ranOnceRef.current) return;
    ranOnceRef.current = true;

    const controller = new AbortController();

    (async () => {
      dispatch(setSubscriptionChecking(true));
      try {
        const res = await axios.get(API.SUBSCRIPTION_ME, {
          ...authCfg(),
          signal: controller.signal,
        });

        const payload = res?.data?.data;
        dispatch(
          setSubscription({
            isActive: !!payload?.isActive,
            subscription: payload?.subscription || { status: "none" },
          })
        );
      } catch (e) {
        if (e?.code !== "ERR_CANCELED") {
          dispatch(
            setSubscription({
              isActive: false,
              subscription: { status: "none" },
            })
          );
        }
      }
    })();

    return () => controller.abort();
  }, [shouldRequire, subscriptionLoaded, isSubscriptionChecking, dispatch]);

  if (!shouldRequire) return children;

  if (isSubscriptionChecking || !subscriptionLoaded) {
    return <div className="text-center mt-10">Checking subscription...</div>;
  }

  if (!subscription?.isActive) {
    return <Navigate to="/subscribe" replace state={{ from: location.pathname }} />;
  }

  return children;
}