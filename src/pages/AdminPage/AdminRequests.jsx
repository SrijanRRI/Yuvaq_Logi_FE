import React, { useState } from "react";
import {
  CheckCircle, XCircle, Loader2, UserPlus, Mail, AlertCircle,
  User, Landmark, Copy, ExternalLink, ShieldCheck, ShieldAlert
} from "lucide-react";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const GST_PORTAL_URL = "https://services.gst.gov.in/services/searchtp";

/** Open GST portal in a new tab and copy GSTIN to clipboard for quick paste */
async function openGstPortalWithCopy(gstin) {
  try {
    // copy so user can just paste into the portal
    await navigator.clipboard.writeText(gstin);
  } catch (e) {
    // ignore; clipboard might be blocked—user can still select manually
  }
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
  navigator.clipboard.writeText(gstin)
    .then(() => onDone?.("GSTIN copied"))
    .catch(() => onDone?.("Copy failed — select manually"));
}

const AdminRequests = ({
  requests = [],
  loading = false,
  approvingIndex = null,
  handleApprove,
  handleReject,
  onToast
}) => {

  const [copied, setCopied] = useState({ idx: null, ok: false });

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="text-white h-5 w-5" />
          <h2 className="text-xl font-bold text-white">Transporters & Users Requests</h2>
        </div>
        <div className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
          {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
        </div>
      </div>

      <div className="p-6">
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
            <p className="text-gray-500 text-lg">No pending requests</p>
            <p className="text-gray-400 text-sm mt-2">New transport user requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((user, idx) => {
              const gstin = user.gstn || user.gstin || ""; // be tolerant to either key
              const nameInitial = (user.name || "?").charAt(0).toUpperCase();
              const onToastMsg = (msg) => onToast?.(msg);
              const justCopied = copied.idx === idx && copied.ok;

              return (
                <div
                  key={idx}
                  className="flex flex-col gap-4 p-5 rounded-lg border border-gray-100 bg-white hover:shadow-md transition-all duration-200"
                >

                  {/* Screen reader live region for copy feedback */}
                  <div className="sr-only" aria-live="polite">
                    {justCopied ? "GSTIN copied to clipboard" : ""}
                  </div>

                  {/* Top row: identity */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-700 font-bold">{nameInitial}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{user.name}</h3>
                        <div className="flex items-center gap-3 text-gray-500 text-sm flex-wrap">
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

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(idx)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${approvingIndex === idx
                          ? "bg-indigo-100 text-indigo-700 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        disabled={approvingIndex === idx}
                      >
                        {approvingIndex === idx ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleReject(idx)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* GST block */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-600 text-sm">GST Number</span>
                        <GstvBadge gstin={gstin} />
                      </div>

                      <div className="flex items-center gap-2">
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
                            onToastMsg?.("GSTIN copied. Portal opened—paste it into the field.");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                          title="Open official GST search portal"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Verify on GST Portal
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <code className="font-mono text-base sm:text-lg tracking-wide bg-white px-2 py-1 rounded border border-gray-200 text-gray-900">
                        {gstin || "—"}
                      </code>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Tip: Clicking “Verify on GST Portal” opens the official site and copies the GSTIN. Due to their CAPTCHA, you’ll need to paste it and solve the challenge manually.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
