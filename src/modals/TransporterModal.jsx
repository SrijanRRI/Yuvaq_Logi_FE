import { useState, useEffect } from "react"
import { Truck, X, Check, Search, Loader2 } from "lucide-react"
import axios from "axios"
import API from "../API"

const TransporterModal = ({ selected, onClose, onSave, setTransporterList: updateParentTransporterList }) => {
  const [transporterList, setTransporterList] = useState([])
  const [localSelection, setLocalSelection] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Fetch transporters and initialize local selection
    const fetchTransporters = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${API.FETCH_ALL_TRANSPORTER}`, {
          withCredentials: true,
        })

        const data = Array.isArray(response.data.data) ? response.data.data : []

        setTransporterList(data)
        updateParentTransporterList?.(data)

        //  Auto-select all if no initial selection
        if (!selected || selected.length === 0) {
          const allIds = data.map((t) => t._id)
          setLocalSelection(allIds)
        } else {
          setLocalSelection(selected)
        }
      } catch (error) {
        console.error("Failed to fetch transporters:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransporters()
  }, [selected, updateParentTransporterList])

  const handleCheckboxChange = (transporterId) => {
    setLocalSelection((prev) =>
      prev.includes(transporterId) ? prev.filter((item) => item !== transporterId) : [...prev, transporterId],
    )
  }

  // const toggleSelectAll = () => {
  //   if (localSelection.length === transporterList.length) {
  //     setLocalSelection([]) // Unselect all
  //   } else {
  //     setLocalSelection(transporterList.map((t) => t._id))
  //   }
  // }

  const handleSave = () => {
    onSave(localSelection)
    onClose()
  }

  const filteredTransporters = transporterList.filter(
    (t) =>
      (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Select Transporters
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search transporters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-3" />
              <p className="text-slate-600">Loading transporters...</p>
            </div>
          ) : filteredTransporters.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-slate-50 rounded-full p-4 inline-flex mb-3">
                <Truck className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No transporters found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Select All Section */}
              {/* <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100 sticky top-0 z-10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={localSelection.length === transporterList.length}
                      onChange={toggleSelectAll}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded transition-all duration-200 flex items-center justify-center
                        ${
                          localSelection.length === transporterList.length
                            ? "bg-emerald-600 border-emerald-600"
                            : localSelection.length > 0
                              ? "bg-emerald-200 border-emerald-300"
                              : "border-slate-300 bg-white"
                        }
                        border transform hover:scale-110`}
                    >
                      {localSelection.length > 0 && (
                        <Check
                          className={`h-3.5 w-3.5 ${
                            localSelection.length === transporterList.length ? "text-white" : "text-emerald-600"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">
                      {localSelection.length === transporterList.length ? "Deselect All" : "Select All Transporters"}
                    </span>
                    <p className="text-sm text-slate-500">
                      {localSelection.length} of {transporterList.length} selected
                    </p>
                  </div>
                </label>
              </div> */}

              {/* Transporter List */}
              <div className="space-y-1 py-2">
                {filteredTransporters.map((transporter) => (
                  <label
                    key={transporter._id}
                    // className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-not-allowed"
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
                        {localSelection.includes(transporter._id) && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-800 font-medium">{transporter.name || "Unnamed Transporter"}</span>
                      {transporter.email && <p className="text-sm text-slate-500">{transporter.email}</p>}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors duration-200 font-medium flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium flex items-center gap-2 shadow-sm"
            >
              <Check className="h-4 w-4" /> Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransporterModal
