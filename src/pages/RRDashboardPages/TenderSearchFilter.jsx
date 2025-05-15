import { Search, Filter, Calendar, X, XCircle, Check } from "lucide-react"

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
  // Status options with their respective styles
  const statusOptions = [
    {
      value: "all",
      label: "All",
      className: "bg-gradient-to-r from-slate-500 to-slate-600 text-white border-slate-700",
    },
    {
      value: "finalized",
      label: "Finalized",
      className: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-700",
    },
    {
      value: "open",
      label: "Open",
      className: "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-700",
    },
    {
      value: "closed",
      label: "Closed",
      className: "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-700",
    },
  ]

  return (
    <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 transform hover:shadow-xl">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-slate-700">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-emerald-400" />
          Search & Filter Tenders
        </h3>
      </div>

      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search Input */}
          <div
            className={`relative flex-grow max-w-xl transition-all duration-300 ${searchFocused ? "scale-102" : ""}`}
          >
            <div
              className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${searchFocused ? "text-emerald-500" : "text-slate-400"}`}
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
              className={`w-full pl-12 pr-12 py-3.5 border rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-700 transition-all duration-300 ${
                searchFocused ? "border-emerald-500 shadow-emerald-100" : "border-slate-300"
              }`}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 shadow-md ${
              filterOpen
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
              <span className="flex items-center justify-center bg-white text-emerald-600 text-xs w-5 h-5 rounded-full font-bold">
                {(statusFilter !== "all" ? 1 : 0) + (dateRange.from || dateRange.to ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filter Options */}
        <div
          className={`mt-6 overflow-hidden transition-all duration-500 ease-in-out ${
            filterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div className="space-y-3">
              <label className=" text-sm font-medium text-slate-700 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm border ${
                      statusFilter === status.value
                        ? `${status.className} shadow-md scale-105`
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {statusFilter === status.value && <Check className="h-3.5 w-3.5" />}
                      {status.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filters */}
            {["from", "to"].map((type) => (
              <div key={type} className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  {type === "from" ? "From Date" : "To Date"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={dateRange[type]}
                    onChange={(e) => setDateRange({ ...dateRange, [type]: e.target.value })}
                    className="pl-10 pr-3 py-2.5 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>

          {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
            <div className="mt-5 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <X className="h-4 w-4" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(statusFilter !== "all" || dateRange.from || dateRange.to) && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Active filters:</span>

          {statusFilter !== "all" && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                statusFilter === "finalized"
                  ? "bg-emerald-100 text-emerald-700"
                  : statusFilter === "open"
                    ? "bg-amber-100 text-amber-700"
                    : statusFilter === "closed"
                      ? "bg-red-100 text-red-700"
                      : ""
              }`}
            >
              Status: {statusFilter}
            </span>
          )}

          {(dateRange.from || dateRange.to) && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              Date: {dateRange.from || "Any"} to {dateRange.to || "Any"}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default TenderSearchFilter
