import { Check, Loader2, Truck } from "lucide-react";

export const TransporterList = ({
  transporterList,
  localSelection,
  loading,
  toggleSelectAll,
  handleCheckboxChange,
}) => {
  const isAllSelected = transporterList.length > 0 && localSelection.length === transporterList.length;
  const isPartiallySelected = localSelection.length > 0 && localSelection.length < transporterList.length;

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-5 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-3" />
          <p className="text-slate-600">Loading transporters...</p>
        </div>
      </div>
    );
  }

  if (transporterList.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-5 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="bg-slate-50 rounded-full p-4 inline-flex mb-3">
            <Truck className="h-10 w-10 text-slate-300" />
          </div>
          <p className="text-slate-600 font-medium">No transporters found</p>
          <p className="text-slate-500 text-sm mt-1">No transporters are available for selection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 pb-0">
      {/* Select All Section */}
      {/* <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 sticky top-0 z-10">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded transition-all duration-200 flex items-center justify-center
                ${
                  isAllSelected
                    ? "bg-emerald-600 border-emerald-600"
                    : isPartiallySelected
                    ? "bg-emerald-200 border-emerald-300"
                    : "border-slate-300 bg-white"
                }
                border transform hover:scale-110`}
            >
              {(isAllSelected || isPartiallySelected) && (
                <Check
                  className={`h-3.5 w-3.5 ${
                    isAllSelected ? "text-white" : "text-emerald-600"
                  }`}
                />
              )}
            </div>
          </div>
          <div>
            <span className="font-medium text-slate-800">
              {isAllSelected ? "Deselect All" : "Select All Transporters"}
            </span>
            <p className="text-sm text-slate-500">
              {localSelection.length} of {transporterList.length} selected
            </p>
          </div>
        </label>
      </div> */}

      {/* Transporter List */}
      <div className="space-y-1 py-2 max-h-[400px]">
        {transporterList.map((transporter) => (
          <label
            key={transporter._id}
            // className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors duration-200  cursor-pointer"
            className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors duration-200  cursor-not-allowed"
          >
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                // checked={localSelection.includes(transporter._id)}
                // onChange={() => handleCheckboxChange(transporter._id)}
                checked={true}
                className="sr-only"
                disabled
              />
              <div
                className={`w-5 h-5 rounded transition-all duration-200 transform ${
                  localSelection.includes(transporter._id)
                    ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-700"
                    : "border-slate-300 hover:border-emerald-400"
                } border flex items-center justify-center`}
              >
                {localSelection.includes(transporter._id) && (
                  <Check className="h-3.5 w-3.5 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-slate-800 font-medium">
                {transporter.name || "Unnamed Transporter"}
              </span>
              {transporter.email && (
                <p className="text-sm text-slate-500">{transporter.email}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      
      {/* Add bottom padding for scrolling area to ensure it doesn't get hidden behind the footer */}
      <div className="h-4"></div>
    </div>
  );
};