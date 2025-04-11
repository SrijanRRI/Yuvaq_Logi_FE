import { Search, Filter, Calendar, X, XCircle } from "lucide-react"

const TenderSearchFilter = ({
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  filterOpen,
  setFilterOpen,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  clearSearch,
  clearFilters,
}) => {
  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search Input */}
        <div
          className={`relative flex-grow max-w-xl transition-all duration-300 ${searchFocused ? "scale-105" : ""}`}
        >
          <div
            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${searchFocused ? "text-emerald-500" : "text-slate-400"}`}
          >
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search by project name, code or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full pl-10 pr-10 py-3 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-700 transition-all duration-300 ${searchFocused ? "border-emerald-500" : "border-slate-300"}`}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${filterOpen
            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
            <span className="flex items-center justify-center bg-emerald-500 text-white text-xs w-5 h-5 rounded-full">
              {(statusFilter !== "all" ? 1 : 0) + (dateRange.from || dateRange.to ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Expandable Filter Options */}
      <div
        className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden transition-all duration-300 ${filterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <div className="flex flex-wrap gap-2">
            {["all", "finalized", "Open"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? status === "finalized"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : status === "Open"
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        {["from", "to"].map((type) => (
          <div key={type} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{type === "from" ? "From Date" : "To Date"}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="date"
                value={dateRange[type]}
                onChange={(e) => setDateRange({ ...dateRange, [type]: e.target.value })}
                className="pl-10 pr-3 py-2 w-full border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        ))}

        {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenderSearchFilter
