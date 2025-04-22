import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ConfirmationModal = ({ message, onConfirm, onCancel, isLoading = false }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md transform transition-all animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 rounded-full">
            <AlertCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">Confirm Action</h3>
          <button
            onClick={onCancel}
            className="ml-auto p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6 text-slate-600 leading-relaxed">
          {typeof message === "string" ? (
            <p>{message}</p>
          ) : (
            message
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors flex items-center gap-2"
          >
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {isLoading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};