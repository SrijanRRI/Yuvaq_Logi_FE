import React from "react";
import { CheckCircle, XCircle, Loader2, UserPlus, Mail, AlertCircle,User} from 'lucide-react';

const AdminRequests = ({
  requests = [],
  loading = false,
  approvingIndex = null,
  handleApprove,
  handleReject,
}) => {
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
            {requests.map((user, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 rounded-lg border border-gray-100 bg-white hover:shadow-md transition-all duration-200"
              >
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 font-bold">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{user.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <User className="h-3 w-3 mr-1" />
                        <span>{user.role}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      approvingIndex === idx
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;