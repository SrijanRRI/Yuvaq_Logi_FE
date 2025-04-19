import { useEffect, useState } from "react"
import {
  Calendar,
  MapPin,
  Package,
  Clock,
  Upload,
  Timer,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import QuotationModal from "../../modals/QuotationModal"
import axios from "axios"
import API from "../../API"
import QuotationSlideshow from "./QuotationSlideShow"
import GetMyPosition from "./GetMyPositon"

const LiveBidding = () => {
  const [tenders, setTenders] = useState([])
  const [selectedTender, setSelectedTender] = useState(null)
  const [countdowns, setCountdowns] = useState({})
  const [slideshowData, setSlideshowData] = useState({})
  const [expandedMaterials, setExpandedMaterials] = useState({})

  const fetchLiveBidingTenders = async () => {
    try {
      const res = await axios.get(API.LIVE_BIDING_TENDERS, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      const fetchedTenders = res.data?.data || []
      setTenders(fetchedTenders)

      const now = new Date().getTime()
      const newCountdowns = {}
      fetchedTenders.forEach((tender) => {
        const end = new Date(tender.biddingEnd).getTime()
        newCountdowns[tender._id] = Math.max(0, end - now)
      })
      setCountdowns(newCountdowns)

      for (const tender of fetchedTenders) {
        const quotesRes = await axios.get(`${API.GET_QUOTATION_SLIDESHOW}/${tender._id}`, {
          withCredentials: true,
        })
        setSlideshowData((prev) => ({ ...prev, [tender._id]: quotesRes.data?.quotations || [] }))
      }
    } catch (err) {
      console.error("Error fetching live tenders:", err)
    }
  }

  useEffect(() => {
    fetchLiveBidingTenders()

    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((id) => {
          updated[id] = Math.max(0, updated[id] - 1000)
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleMaterials = (tenderId) => {
    setExpandedMaterials((prev) => ({
      ...prev,
      [tenderId]: !prev[tenderId],
    }))
  }

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A"

  const formatDateTime = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A"

  const formatMillis = (ms) => {
    if (ms <= 0) return "Bidding Closed"
    const totalSeconds = Math.floor(ms / 1000)
    const hrs = Math.floor((totalSeconds % 86400) / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs}h ${mins}m ${secs}s`
  }

  return (
    <div className="grid gap-8">
      {tenders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-slate-200 text-center shadow-lg">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Timer className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Live Bidding Available</h3>
          <p className="text-slate-500 max-w-md">
            There are currently no active bidding sessions. Check back later or explore upcoming tenders.
          </p>
        </div>
      ) : (
        tenders.map((tender, idx) => {
          const hasQuotations = slideshowData[tender._id]?.length > 0
          const timeLeft = countdowns[tender._id] || 0
          const isExpired = timeLeft <= 0
          const isMaterialsExpanded = expandedMaterials[tender._id] || false

          return (
            <div
              key={tender._id || idx}
              className="rounded-xl overflow-hidden border border-slate-200 transition-all hover:shadow-lg bg-white"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <h2 className="text-indigo-200 text-2xl font-bold "> Tender #{idx + 1} </h2>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white bg-opacity-20 text-white text-sm font-medium border border-white border-opacity-30 backdrop-blur-sm">
                    {tender.bidsUsed || 0}/3 Bids Used
                  </div>
                </div>
              </div>

              {/* Countdown and Position */}
              <div className="p-4 flex flex-col sm:flex-row items-stretch gap-4">
                <div
                  className={`flex-1 flex items-center gap-3 p-4 rounded-lg ${isExpired ? "bg-red-50 border border-red-100" : "bg-blue-50 border border-blue-100"}`}
                >
                  <div className={`p-3 rounded-full ${isExpired ? "bg-red-100" : "bg-blue-100"}`}>
                    <Timer className={`w-6 h-6 ${isExpired ? "text-red-500" : "text-blue-500"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isExpired ? "text-red-700" : "text-blue-700"}`}>
                      {isExpired ? "Bidding Ended" : "Bidding Ends In"}
                    </p>
                    <p className={`text-xl font-bold ${isExpired ? "text-red-800" : "text-blue-800"}`}>
                      {formatMillis(timeLeft)}
                    </p>
                  </div>
                </div>

                <GetMyPosition tenderId={tender._id} />
              </div>

              {/* Main Content */}
              <div className="p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="bg-emerald-100 p-2.5 rounded-full">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Location</p>
                      <p className="font-medium text-slate-800">{tender.dispatchLocation || "No location"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="bg-amber-100 p-2.5 rounded-full">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Delivery Window</p>
                      <p className="font-medium text-slate-800">
                        {formatDate(tender.deliveryWindow?.from)} → {formatDate(tender.deliveryWindow?.to)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="bg-blue-100 p-2.5 rounded-full">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Close Date</p>
                      <p className="font-medium text-slate-800">{formatDate(tender.closeDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="bg-purple-100 p-2.5 rounded-full">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Bidding Period</p>
                      <p className="font-medium text-slate-800">
                        {formatDateTime(tender.biddingStart)} → {formatDateTime(tender.biddingEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="bg-rose-100 p-2.5 rounded-full">
                      <Package className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Shipment Details</p>
                      <p className="font-medium text-slate-800">
                        {tender.totalWeight} kg | {tender.totalQuantity} pcs
                      </p>
                    </div>
                  </div>
                </div>

                {tender.remarks && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-800 mb-1">Remarks</p>
                        <p className="text-amber-700 text-sm">{tender.remarks}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Materials Accordion */}
                {tender.materials?.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => toggleMaterials(tender._id)}
                      className="w-full flex items-center justify-between gap-2 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-sm mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <Package className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-slate-800">Materials</h4>
                          <p className="text-xs text-slate-500">
                            {tender.materials.length} {tender.materials.length === 1 ? "item" : "items"} |{" "}
                            {tender.totalWeight} kg Total Weight | {" "} {tender.totalQuantity} pcs Total Quantity
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 hidden sm:inline">
                          {isMaterialsExpanded ? "Hide details" : "Show details"}
                        </span>
                        {isMaterialsExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {/* Materials Table - Visible when expanded */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${isMaterialsExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      {/* Large Screen Table */}
                      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                              <th className="px-4 py-3 text-left font-medium text-slate-700">Material</th>
                              <th className="px-4 py-3 text-left font-medium text-slate-700">Sub Material</th>
                              <th className="px-4 py-3 text-right font-medium text-slate-700">Weight (kg)</th>
                              <th className="px-4 py-3 text-right font-medium text-slate-700">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tender.materials.map((m, i) => (
                              <tr
                                key={m._id || i}
                                className={`border-t border-slate-200 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                              >
                                <td className="px-4 py-3 font-medium text-slate-700">{m.material}</td>
                                <td className="px-4 py-3 text-slate-600">{m.subMaterial || "-"}</td>
                                <td className="px-4 py-3 text-right text-slate-700">{m.weight ?? "-"}</td>
                                <td className="px-4 py-3 text-right text-slate-700">{m.quantity ?? "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gradient-to-r from-slate-100 to-slate-50 border-t border-slate-200">
                            <tr>
                              <td colSpan="2" className="px-4 py-2 text-right font-medium text-slate-700">
                                Total:
                              </td>
                              <td className="px-4 py-2 text-right font-bold text-slate-800">{tender.totalWeight} kg</td>
                              <td className="px-4 py-2 text-right font-bold text-slate-800">
                                {tender.totalQuantity} pcs
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-3 mt-2">
                        {tender.materials.map((m, i) => (
                          <div key={m._id || i} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-slate-800">{m.material}</h5>
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                {m.quantity} pcs
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-slate-500">Sub Material</p>
                                <p className="text-slate-700">{m.subMaterial || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Weight</p>
                                <p className="text-slate-700 font-medium">{m.weight || "-"} kg</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-3 flex justify-between items-center">
                          <span className="font-medium text-slate-700">Total:</span>
                          <div className="flex gap-4">
                            <span className="text-slate-800 font-bold">{tender.totalWeight} kg</span>
                            <span className="text-slate-800 font-bold">{tender.totalQuantity} pcs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quotation Slideshow */}
                {hasQuotations && (
                  <div className="mb-6">
                    <QuotationSlideshow quotations={slideshowData[tender._id]} />
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-center mt-8">
                  {isExpired ? (
                    <div className="px-6 py-3 rounded-lg bg-slate-100 text-slate-500 flex items-center gap-2 shadow-sm">
                      <X className="w-5 h-5" />
                      <span>Bidding Closed</span>
                    </div>
                  ) : tender.bidsUsed >= 3 ? (
                    <div className="px-6 py-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-2 shadow-sm">
                      <Check className="w-5 h-5" />
                      <span>You have submitted 3/3 quotations</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTender(tender)}
                      className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md flex items-center gap-2 font-medium"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Submit Quotation</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}

      {selectedTender && (
        <QuotationModal
          tender={selectedTender}
          onClose={() => setSelectedTender(null)}
          onSuccess={() => {
            fetchLiveBidingTenders()
            setSelectedTender(null)
          }}
        />
      )}
    </div>
  )
}

export default LiveBidding
