import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import API from "../../API"
import { TrendingUp, Info, RotateCcw } from "lucide-react"

const GetMyPosition = ({ tenderId }) => {
  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPosition = useCallback(async () => {
    if (!tenderId) return
    try {
      setLoading(true)
      const res = await axios.get(`${API.GET_MY_POSITION}/${tenderId}`, { withCredentials: true })
      setPosition(res.data?.position || null)
      setError(null)
    } catch (err) {
      const errMessage = err?.response?.data?.message || "Something went wrong. Please try again."
      setError("Unable to retrieve your current bid rank.")
    } finally {
      setLoading(false)
    }
  }, [tenderId])

  useEffect(() => {
    if (!tenderId) return
    fetchPosition()
    const interval = setInterval(fetchPosition, 15000)
    return () => clearInterval(interval)
  }, [fetchPosition, tenderId])

  if (!tenderId) return null

  return (
    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-100 to-purple-100 border border-violet-300 rounded-xl shadow-md flex-grow">
      {loading ? (
        <div className="animate-pulse text-indigo-600 text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>Fetching your current position...</span>
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 font-medium flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : position ? (
        <div className="text-sm text-violet-900 font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-700" />
          <span>
            Your Current Rank: <span className="font-bold">{position}</span>
          </span>
        </div>
      ) : null}

      {/* Manual Reload Button */}
      <button
        onClick={fetchPosition}
        disabled={loading}
        className={`p-2 rounded-full border border-violet-300 bg-white hover:bg-violet-100 shadow-sm transition duration-200 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title="Refresh Rank"
      >
        <RotateCcw className="w-4 h-4 text-violet-600" />
      </button>
    </div>
  )
}

export default GetMyPosition
