import { ChevronDown, ChevronUp, Package, Calendar, MapPin } from "lucide-react"

const TenderCard = ({ tender, isOpen, onToggle }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })

  return (
    <div
      className={`p-5 cursor-pointer transition-all duration-300 ${isOpen ? "bg-slate-50" : "hover:bg-slate-50/70"}`}
      onClick={onToggle}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-start md:items-center gap-4">
          <div
            className={`p-3 rounded-xl ${tender.status === "finalized" ? "bg-emerald-100 text-emerald-600" : tender.status === "closed" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"} shadow-sm`}
          >
            <Package className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {tender.projectName || `Tender for ${tender.dispatchLocation || "Unknown Location"}`}
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(new Date(tender.createdAt))}
              </div>

              <div className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-slate-400" />
                {tender.materials?.length || 0} materials
              </div>

              {tender.projectCode && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-600">Project Code:</span> {tender.projectCode}
                </div>
              )}

              {tender.dispatchLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {tender.dispatchLocation}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-12 md:ml-0">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide ${
              tender.status === "finalized"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : tender.status === "closed"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            {tender.status || "PENDING"}
          </span>

          <div
            className={`p-2 rounded-full ${isOpen ? "bg-slate-200" : "bg-slate-100"} transition-colors duration-200`}
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-slate-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenderCard
