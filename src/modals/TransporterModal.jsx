import { useState, useEffect } from "react"
import { X, Truck, Check, Loader2 } from "lucide-react"
import axios from "axios"
import API from "../API"

export const TransporterModal = ({ selected, onClose, onSave, setTransporterList: updateParentTransporterList }) => {
  const [transporterList, setTransporterList] = useState([])
  const [localSelection, setLocalSelection] = useState([])
  const [loading, setLoading] = useState(true)

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
    // setLocalSelection(selected || [])
  }, [selected, updateParentTransporterList])

  const handleCheckboxChange = (transporter) => {
    setLocalSelection((prev) =>
      prev.includes(transporter) ? prev.filter((item) => item !== transporter) : [...prev, transporter],
    )
  }

  const toggleSelectAll = () => {
    if (localSelection.length === transporterList.length) {
      setLocalSelection([]) // Unselect all
    } else {
      setLocalSelection(transporterList.map((t) => t._id))
    }
  }

  const handleSave = () => {
    onSave(localSelection)
    onClose()
  }

  const isAllSelected = transporterList.length > 0 && localSelection.length === transporterList.length
  const isPartiallySelected = localSelection.length > 0 && localSelection.length < transporterList.length

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg p-6 relative max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-5">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-600" />
            Select Transporters
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:bg-slate-100 rounded-full p-1.5 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!loading && transporterList.length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded transition-colors duration-200 flex items-center justify-center
                    ${isAllSelected ? "bg-emerald-600 border-emerald-600" :
                      isPartiallySelected ? "bg-emerald-200 border-emerald-300" : "border-slate-300 bg-white"}
                    border`}
                >
                  {(isAllSelected || isPartiallySelected) && (
                    <Check className={`h-3.5 w-3.5 ${isAllSelected ? "text-white" : "text-emerald-600"}`} />
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
          </div>
        )}

        <div className="space-y-2 min-h-[200px] flex flex-col justify-center">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            </div>
          ) : transporterList.length > 0 ? (
            <div className="space-y-2 py-2">
              {transporterList.map((transporter) => (
                <label
                  key={transporter._id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={localSelection.includes(transporter._id)}
                      onChange={() => handleCheckboxChange(transporter._id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border ${localSelection.includes(transporter._id)
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-slate-300"
                        } flex items-center justify-center`}
                    >
                      {localSelection.includes(transporter._id) && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-slate-800">{transporter.name || transporter.email}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No transporters found.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Check className="h-4 w-4" /> Save Selection
          </button>
        </div>
      </div>
    </div>
  )
}
