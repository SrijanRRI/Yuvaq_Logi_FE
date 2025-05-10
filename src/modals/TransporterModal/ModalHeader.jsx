import { Truck, X } from "lucide-react";

export const ModalHeader = ({ onClose }) => {
  return (
    <div className="border-b border-slate-200 p-5 sticky top-0 bg-white z-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Truck className="h-5 w-5 text-emerald-600" />
          Select Transporters
        </h2>
        <button
          onClick={onClose}
          className="text-slate-500 hover:bg-slate-100 rounded-full p-1.5 transition-all duration-200 hover:rotate-90"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};