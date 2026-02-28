import React, { useState, useEffect } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";

export default function DeleteTenderModal({
  isOpen,
  tender,
  onClose,
  onConfirm,
  isLoading = false,
  errorText = "",
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            <div>
              <div className="text-lg font-bold">Delete / Cancel Tender</div>
              <div className="text-xs text-white/90">
                Allowed only before bidding starts • 3 per day limit
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-60"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <div>
              <div className="font-semibold">Are you sure you want to cancel this tender?</div>
              <div className="text-xs mt-1">
                Project: <b>{tender?.projectName || "-"}</b> • Code: <b>{tender?.projectCode || "-"}</b>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Reason (required)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Write a genuine reason for cancellation…"
              className="mt-2 w-full min-h-[110px] px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              disabled={isLoading}
            />
          </div>

          {errorText ? (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              {errorText}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => onConfirm(reason)}
              disabled={isLoading || !reason.trim()}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 inline-flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isLoading ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}