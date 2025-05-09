import { ChevronDown, ChevronUp, Package } from "lucide-react";

const TenderCard = ({ tender, isOpen, onToggle, children }) => {

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200">
      <div
        className="p-5 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                Tender : {tender.projectName || `Tender for ${tender.dispatchLocation || "Unknown Location"}`}
              </h3>
              <p className="text-sm text-slate-500">
                Created on {formatDate(new Date(tender.createdAt))} • {tender.materials?.length || 0} materials
                {tender.projectCode && ` • Project Code: ${tender.projectCode}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tender.status === "finalized" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {tender.status || "PENDING"}
            </span>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>
      {isOpen && <div className="border-t border-slate-200 p-5">{children}</div>}
    </div>
  );
};

export default TenderCard;