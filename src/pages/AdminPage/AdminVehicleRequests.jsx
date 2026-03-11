import React, { useState } from "react";
import {
  Truck,
  Loader2,
  CheckCircle,
  XCircle,
  ClipboardList,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

const AdminVehicleRequests = ({
  requests = [],
  loading = false,
  processingId = "",
  onApprove,
  onReject,
}) => {
  const [remarks, setRemarks] = useState({});
  const [addToCatalogMap, setAddToCatalogMap] = useState({});

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-white h-5 w-5" />
          <h2 className="text-xl font-bold text-white">Vehicle Requests</h2>
        </div>
        <div className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
          {requests.length} Pending
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="text-orange-600 font-medium">Loading vehicle requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-gray-600 text-base sm:text-lg">No pending vehicle requests</p>
            <p className="text-gray-400 text-sm mt-2">Transporter custom vehicle requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((item) => {
              const transporter = item.transportUser || {};
              const remark = remarks[item._id] || "";
              const addToCatalog = addToCatalogMap[item._id] ?? true;
              const isBusy = processingId === item._id;

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Truck className="h-3.5 w-3.5" />
                          Custom Vehicle Request
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                          Status: {item.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{item.subCategory}</h3>
                        <div className="text-sm text-slate-600 mt-1">{item.category}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            Group
                          </div>
                          <div className="mt-1 font-semibold text-slate-900">{item.group || "—"}</div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Quantity Owned
                          </div>
                          <div className="mt-1 font-semibold text-slate-900">{item.quantityOwned || 1}</div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs text-slate-500">Requested At</div>
                          <div className="mt-1 font-semibold text-slate-900">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900 mb-3">Transporter Details</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-700">
                            <User className="h-4 w-4 text-slate-500" />
                            <span>{transporter.name || "—"}</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-700">
                            <Mail className="h-4 w-4 text-slate-500" />
                            <span>{transporter.email || "—"}</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone className="h-4 w-4 text-slate-500" />
                            <span>{transporter.phone || "—"}</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-700">
                            <ClipboardList className="h-4 w-4 text-slate-500" />
                            <span>{transporter.transportId || transporter.gstn || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:w-[360px] space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Admin Remark
                        </label>
                        <textarea
                          value={remark}
                          onChange={(e) =>
                            setRemarks((prev) => ({ ...prev, [item._id]: e.target.value }))
                          }
                          placeholder="Optional remark for transporter"
                          className="w-full min-h-[90px] px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        />

                        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={addToCatalog}
                            onChange={(e) =>
                              setAddToCatalogMap((prev) => ({
                                ...prev,
                                [item._id]: e.target.checked,
                              }))
                            }
                          />
                          Also add to master vehicle catalog
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            onApprove(item._id, {
                              addToCatalog,
                              adminRemark: remark,
                              sortOrder: 0,
                            })
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            onReject(item._id, {
                              adminRemark: remark,
                            })
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition disabled:opacity-60"
                        >
                          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          Reject
                        </button>
                      </div>
                    </div>
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

export default AdminVehicleRequests;