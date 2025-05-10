import { Check, X } from "lucide-react";

export const ModalFooter = ({ onClose, handleSave }) => {
  return (
    <div className="p-5 border-t border-slate-200 bg-white sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-medium flex items-center gap-2"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 font-medium flex items-center gap-2 shadow-sm"
        >
          <Check className="h-4 w-4" /> Save Selection
        </button>
      </div>
    </div>
  );
};