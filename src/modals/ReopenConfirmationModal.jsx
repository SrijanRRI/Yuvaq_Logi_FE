import { useState } from "react";

const ReopenConfirmationModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");

  const handleCancel = () => {
    if (typeof onCancel === "function") {
      onCancel(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
        <h3 className="text-lg font-semibold mb-3">Reopen Quotation</h3>

        <label className="block mb-2 text-slate-700 text-sm font-medium">
          Please provide a reason to reopen this tender:
        </label>
        <textarea
          className="w-full border border-slate-300 rounded-md p-2"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for reopening..."
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Reopen Tender
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReopenConfirmationModal;
