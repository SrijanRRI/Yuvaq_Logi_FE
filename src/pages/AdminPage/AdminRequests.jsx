import React, { useState } from "react";
import {
  CheckCircle, XCircle, Loader2, UserPlus, Mail, AlertCircle,
  User, Landmark, Copy, ExternalLink, ShieldCheck, ShieldAlert,
  Info
} from "lucide-react";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const GST_PORTAL_URL = "https://services.gst.gov.in/services/searchtp";

/** Open GST portal in a new tab and copy GSTIN to clipboard for quick paste */
async function openGstPortalWithCopy(gstin) {
  try {
    await navigator.clipboard.writeText(gstin);
  } catch { }
  window.open(GST_PORTAL_URL, "_blank", "noopener,noreferrer");
}

function GstvBadge({ gstin }) {
  const valid = GSTIN_REGEX.test(gstin || "");
  return valid ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
      <ShieldCheck className="h-3.5 w-3.5" />
      Valid format
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
      <ShieldAlert className="h-3.5 w-3.5" />
      Format issue
    </span>
  );
}

function copyGstin(gstin, onDone) {
  navigator.clipboard
    .writeText(gstin)
    .then(() => onDone?.("GSTIN copied"))
    .catch(() => onDone?.("Copy failed — select manually"));
}

function pluralize(n, one, many) {
  return n === 1 ? one : many;
}

function ordinal(n) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

const AdminRequests = ({
  requests = [],
  loading = false,
  approvingIndex = null,
  handleApprove,
  handleReject,
  onToast,
  currentAdminId,
}) => {
  const [copied, setCopied] = useState({ idx: null, ok: false });

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="text-white h-5 w-5" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Transporters & Users Requests</h2>
        </div>
        <div className="text-white text-xs sm:text-sm font-medium bg-white/20 px-2 sm:px-3 py-1 rounded-full">
          {requests.length} {pluralize(requests.length, "Request", "Requests")}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-indigo-600 font-medium">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="text-gray-600 text-base sm:text-lg">No pending requests</p>
            <p className="text-gray-400 text-sm mt-2">New transport user requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((user, idx) => {
              // tolerant shapes
              const gstin = user.gstn || user.gstin || "";
              const approvals = user.approvals || {};
              const currentApprovals =
                approvals.approvedBy?.length ??
                user.currentApprovals ??
                user.approvalCount ??
                0;
              const requiredApprovals =
                approvals.requiredApprovals ??
                user.requiredApprovals ??
                2;
              const finalizedAt =
                approvals.finalizedAt ??
                user.finalizedAt ??
                null;
              const approvedBy = approvals.approvedBy || [];
              const approvedByMe = currentAdminId
                ? approvedBy.some((id) => String(id) === String(currentAdminId))
                : false;
              const progress = Math.min(
                100,
                Math.round((currentApprovals / Math.max(requiredApprovals || 2, 1)) * 100)
              );

              const nameInitial = (user.name || "?").charAt(0).toUpperCase();
              const onToastMsg = (msg) => onToast?.(msg);
              const justCopied = copied.idx === idx && copied.ok;

              const isFullyApproved = Boolean(user.isApproved) || currentApprovals >= requiredApprovals;

              const isTransporter = user.role === "transportUser";
              const shouldShowGst = isTransporter || Boolean(gstin);

              const nextOrdinal = ordinal(Math.min(currentApprovals + 1, requiredApprovals));
              const approveLabel = isFullyApproved
                ? "Approved"
                : approvedByMe
                  ? "You approved"
                  : currentApprovals >= requiredApprovals
                    ? "Approve"
                    : `Give ${nextOrdinal} approval`;

              const approveDisabled =
                approvingIndex === idx ||
                isFullyApproved ||
                approvedByMe ||
                currentApprovals >= requiredApprovals;

              return (
                <div
                  key={idx}
                  className="flex flex-col gap-4 p-4 sm:p-5 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200"
                >
                  {/* a11y live copy feedback */}
                  <div className="sr-only" aria-live="polite">
                    {justCopied ? "GSTIN copied to clipboard" : ""}
                  </div>

                  {/* Top row */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Identity */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-700 font-bold text-lg sm:text-base">
                          {nameInitial}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                            {user.name}
                          </h3>
                          {isFullyApproved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Fully approved
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                <Info className="h-3.5 w-3.5" />
                                Needs {requiredApprovals} approvals
                              </span>

                              {approvedByMe && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  You approved
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap gap-1.5 text-gray-600 text-sm">
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {user.role}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Approve / Reject */}
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleApprove(idx)}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200
                          ${approveDisabled
                            ? "bg-indigo-100 text-indigo-700 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        disabled={approveDisabled}
                        title={approvedBy ? "Already fully approved" : undefined}
                      >
                        {approvingIndex === idx ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span className="whitespace-nowrap">{approveLabel}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleReject(idx)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* 2-step approval progress */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-700 font-medium">Approval progress</span>
                        <span className="text-gray-500">
                          {currentApprovals}/{requiredApprovals}
                        </span>
                      </div>
                      {finalizedAt && (
                        <div className="text-xs text-gray-500">
                          Finalized: {new Date(finalizedAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 h-2 w-full bg-white rounded-full border border-gray-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${approvedBy ? "bg-emerald-500" : "bg-indigo-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {!approvedBy && (
                      <p className="mt-2 text-xs text-gray-500">
                        This account requires <span className="font-medium">{requiredApprovals}</span>{" "}
                        admin approvals. Click <span className="font-medium">Approve</span> to add yours.
                      </p>
                    )}
                  </div>

                  {/* GST section */}
                  {shouldShowGst && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700 text-sm font-medium">
                            GST Number
                            {isTransporter && (
                              <span className="ml-2 inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                required
                              </span>
                            )}
                          </span>
                          <GstvBadge gstin={gstin} />
                        </div>

                        <div className="flex items-center gap-2">
                          {gstin ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  copyGstin(gstin, (msg) => {
                                    onToastMsg?.(msg);
                                    const ok = msg?.toLowerCase().includes("copied");
                                    setCopied({ idx, ok });
                                    setTimeout(() => setCopied({ idx: null, ok: false }), 1500);
                                  });
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors
                                ${justCopied
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                                  }`}
                                title={justCopied ? "Copied!" : "Copy GSTIN"}
                              >
                                <Copy className="h-4 w-4" />
                                {justCopied ? "Copied!" : "Copy"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  openGstPortalWithCopy(gstin);
                                  onToastMsg?.("GSTIN copied. Portal opened — paste it and solve the CAPTCHA.");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                                title="Open official GST search portal"
                               >
                                <ExternalLink className="h-4 w-4" />
                                Verify on GST Portal
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {isTransporter
                                ? "GSTIN missing — ask the user to provide it."
                                : "GSTIN not required for this user."}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2">
                        <code className="font-mono text-sm sm:text-base tracking-wide bg-white px-2 py-1 rounded border border-gray-200 text-gray-900">
                          {gstin || (isTransporter ? "— required —" : "—")}
                        </code>
                      </div>
                      {gstin && (
                        <p className="text-xs text-gray-500 mt-2">
                          Note: The GST portal uses a CAPTCHA and blocks cross-site autofill. We open the portal and copy the GSTIN
                          for you so you can paste it quickly.
                        </p>
                      )}
                    </div>
                  )}
                </div>

              );
            })}
          </div>
        )
        }
      </div>
    </div>
  );
};

export default AdminRequests;
