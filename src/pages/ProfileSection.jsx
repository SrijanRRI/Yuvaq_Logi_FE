import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  BadgeCheck,
  Calendar,
  CreditCard,
  Bell,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ClipboardList,
  Copy,
} from "lucide-react";
import API from "../API";

const authCfg = () => {
  const token = localStorage.getItem("session_token");
  return {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 15000,
  };
};

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const safe = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

const roleLabel = (role) => {
  if (role === "transportUser") return "Transport User";
  if (role === "admin") return "Admin";
  return "RR User";
};

const StatusBadge = ({ active, text }) => (
  <span
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-amber-50 text-amber-700 border-amber-200"
    }`}
  >
    <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
    {text}
  </span>
);

const StatTile = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-xs font-medium text-slate-500">{label}</div>
    <div className="mt-1 text-lg font-bold text-slate-900 break-words">{value}</div>
  </div>
);

const InfoTile = ({ icon: Icon, label, value, mono = false, onCopy }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
          <Icon className="h-4 w-4 text-emerald-600" />
        </span>
        <span>{label}</span>
      </div>

      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
          title={`Copy ${label}`}
        >
          <Copy className="h-4 w-4 text-slate-500" />
        </button>
      ) : null}
    </div>

    <div
      className={`mt-3 break-words text-slate-900 font-semibold ${
        mono ? "font-mono text-xs" : "text-sm"
      }`}
    >
      {value}
    </div>
  </div>
);

export default function ProfileSection({ fallbackUser = null }) {
  const [profile, setProfile] = useState(fallbackUser || null);
  const [loading, setLoading] = useState(!fallbackUser);
  const [refreshing, setRefreshing] = useState(false);

  const copyText = async (text, label = "Text") => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  const loadProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axios.get(API.GET_MY_PROFILE, authCfg());
      setProfile(res?.data?.data || null);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscription = profile?.subscription || {};
  const approvals = subscription?.approvals || {};

  const isSubActive = useMemo(() => {
    if (typeof subscription?.isActive === "boolean") return subscription.isActive;
    return (
      subscription?.status === "active" &&
      subscription?.endsAt &&
      new Date(subscription.endsAt) > new Date()
    );
  }, [subscription]);

  const approvedCount = Number(approvals?.approvedCount || 0);
  const requiredApprovals = Number(approvals?.requiredApprovals || 0);
  const approvalPercent =
    requiredApprovals > 0
      ? Math.min(100, Math.round((approvedCount / requiredApprovals) * 100))
      : approvedCount > 0
      ? 100
      : 0;

  if (loading && !profile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
        <RefreshCcw className="h-8 w-8 mx-auto text-emerald-600 animate-spin" />
        <div className="mt-3 text-slate-900 font-semibold">Loading profile...</div>
        <div className="text-sm text-slate-500 mt-1">Fetching your account details</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white">
          <div className="absolute top-0 right-0 h-48 w-48 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-black/10 rounded-full blur-2xl translate-y-8 -translate-x-4" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>

              <div>
                <div className="text-2xl md:text-3xl font-bold">{safe(profile?.name)}</div>
                <div className="mt-1 text-white/90 text-sm">{roleLabel(profile?.role)}</div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    active={!!profile?.isApproved}
                    text={profile?.isApproved ? "Account Approved" : "Approval Pending"}
                  />
                  <StatusBadge
                    active={isSubActive}
                    text={isSubActive ? "Subscription Active" : "Subscription Inactive"}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => loadProfile(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatTile label="Email" value={safe(profile?.email)} />
            <StatTile label="Phone" value={safe(profile?.phone)} />
            <StatTile label="Current Plan" value={safe(subscription?.plan || "No Plan")} />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Account Details
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <InfoTile
                icon={ClipboardList}
                label="User ID"
                value={safe(profile?._id)}
                mono
                onCopy={() => copyText(profile?._id, "User ID")}
              /> */}

              <InfoTile icon={User} label="Role" value={roleLabel(profile?.role)} />

              <InfoTile
                icon={Mail}
                label="Email Address"
                value={safe(profile?.email)}
                onCopy={() => copyText(profile?.email, "Email")}
              />

              <InfoTile
                icon={Phone}
                label="Phone Number"
                value={safe(profile?.phone)}
                onCopy={() => copyText(profile?.phone, "Phone Number")}
              />

              {/* <InfoTile
                icon={Bell}
                label="Notification ID"
                value={safe(profile?.notificationId)}
                mono
                onCopy={
                  profile?.notificationId
                    ? () => copyText(profile?.notificationId, "Notification ID")
                    : null
                }
              /> */}

              <InfoTile
                icon={BadgeCheck}
                label="Approval Status"
                value={profile?.isApproved ? "Approved" : "Pending Approval"}
              />

              {(profile?.gstn || profile?.transportId) && (
                <>
                  <InfoTile
                    icon={ClipboardList}
                    label="GSTIN"
                    value={safe(profile?.gstn)}
                    mono
                    onCopy={profile?.gstn ? () => copyText(profile?.gstn, "GSTIN") : null}
                  />

                  <InfoTile
                    icon={ClipboardList}
                    label="Transport ID"
                    value={safe(profile?.transportId)}
                    mono
                    onCopy={
                      profile?.transportId
                        ? () => copyText(profile?.transportId, "Transport ID")
                        : null
                    }
                  />
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Subscription Details
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  active={isSubActive}
                  text={
                    isSubActive
                      ? `Active • ${safe(subscription?.plan || "Plan")}`
                      : safe(subscription?.status || "No Subscription")
                  }
                />
                <StatusBadge
                  active={!!subscription?.isApproved}
                  text={subscription?.isApproved ? "Subscription Approved" : "Subscription Pending"}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoTile icon={CreditCard} label="Plan" value={safe(subscription?.plan)} />
                <InfoTile icon={Info} label="Status" value={safe(subscription?.status)} />
                <InfoTile icon={Calendar} label="Start Date" value={fmtDateTime(subscription?.startAt)} />
                <InfoTile icon={Calendar} label="End Date" value={fmtDateTime(subscription?.endsAt)} />
                <InfoTile
                  icon={ClipboardList}
                  label="Last Payment ID"
                  value={safe(subscription?.lastPaymentId)}
                  mono
                  onCopy={
                    subscription?.lastPaymentId
                      ? () => copyText(subscription?.lastPaymentId, "Last Payment ID")
                      : null
                  }
                />
                <InfoTile icon={Calendar} label="Subscription Updated At" value={fmtDateTime(subscription?.updatedAt)} />
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-amber-50 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Account Timeline
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Created At</div>
                <div className="mt-1 font-semibold text-slate-900">{fmtDateTime(profile?.createdAt)}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Updated At</div>
                <div className="mt-1 font-semibold text-slate-900">{fmtDateTime(profile?.updatedAt)}</div>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  isSubActive
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isSubActive ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  )}

                  <div>
                    <div className="font-semibold text-slate-900">
                      {isSubActive ? "Subscription is currently active" : "Subscription needs attention"}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Status: <b>{safe(subscription?.status)}</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}