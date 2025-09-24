import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp, Package, Calendar, MapPin, Download } from "lucide-react"

const TenderCard = ({ tender, isOpen, onToggle, onExportPDF, onExportExcel }) => {

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })

  return (
    <div
      className={`p-4 sm:p-5 cursor-pointer transition-all duration-300 ${isOpen ? "bg-slate-50" : "hover:bg-slate-50/70"}`}
      onClick={onToggle}
    >
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${tender.status === "finalized"
              ? "bg-emerald-100 text-emerald-600"
              : tender.status === "closed"
                ? "bg-amber-100 text-amber-600"
                : "bg-blue-100 text-blue-600"
              } shadow-sm`}
          >
            <Package className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800 text-base sm:text-lg break-words">
                {tender.projectName || `Tender for ${tender.dispatchLocation || "Unknown Location"}`}
              </h3>

              {/* Export dropdown */}
              <div
                className="relative flex-shrink-0"
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition"
                  title="Export report"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10">
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => {
                        setMenuOpen(false)
                        onExportPDF && onExportPDF()
                      }}
                    >
                      Export as PDF
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => {
                        setMenuOpen(false)
                        onExportExcel && onExportExcel()
                      }}
                    >
                      Export as Excel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2 mt-1 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatDate(new Date(tender.createdAt))}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 flex-shrink-0" />
                <span className="whitespace-nowrap">{tender.materials?.length || 0} materials</span>
              </div>
              {tender.projectCode && (
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-medium text-slate-600 flex-shrink-0">Project Code:</span>
                  <span className="truncate">{tender.projectCode}</span>
                </div>
              )}
              {tender.dispatchLocation && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{tender.dispatchLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium uppercase tracking-wide flex-shrink-0 ${tender.status === "finalized"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : tender.status === "closed"
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
          >
            {tender.status || "PENDING"}
          </span>
          <div
            className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${isOpen ? "bg-slate-200" : "bg-slate-100"
              } transition-colors duration-200`}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            )}
          </div>
        </div>
      </div>
    </div >
  )
}

export default TenderCard
