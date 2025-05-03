import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"
import axios from "axios"
import { ArrowLeft, History } from "lucide-react"

import Navbar from "../components/Navbar"
import { MaterialModal } from "../modals/MaterialModal"
import { TransporterModal } from "../modals/TransporterModal"
import TenderForm from "./RRDashboardPages/TenderForm"
import TenderHistoryAccordion from "./RRDashboardPages/TenderHistoryAccordion"
import API from "../API"

import { useDispatch } from "react-redux"
import { logout } from "../utils/UserSlice"

const RRDashboardPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [viewHistory, setViewHistory] = useState(false)
  const [tenderHistories, setTenderHistories] = useState([])

  const [form, setForm] = useState({
    deliveryWindow: { from: "", to: "" },
    closingDate: "",
    biddingStart: "",
    biddingEnd: "",
    dispatchLocation: "",
    address: "",
    pincode: "",
    projectName: "",
    projectCode: "",
    purchaseOrder: "",
    projectRemark: "",
    materials: [],
    weight: "",
    quantity: "",
    remarks: "",
    transporter: [],
    isManualTotals: false,
  })

  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showTransporterModal, setShowTransporterModal] = useState(false)

  const [transporterList, setTransporterList] = useState([])
  const [selectedTransporters, setSelectedTransporters] = useState([])

  const [loading, setLoading] = useState(false)

  const userInfo = useSelector((state) => state.User?.userInfo)
  const userName = userInfo?.name || "RR User"

  const fetchTenderHistory = async () => {
    try {
      const response = await axios.get(API.FETCH_ALL_TENDER_CREATED_BY_RRUSER, {
        withCredentials: true,
      })
      const data = response.data?.data || []

      // console.log("Tender's responses histories : ", response.data)
      setTenderHistories(data)
    } catch (err) {
      console.error("Failed to fetch tender history", err)
      toast.error("Could not fetch tender history. Please try again later.")
    }
  }

  useEffect(() => {

    if (viewHistory) {
      fetchTenderHistory()
      fetchTransporters()
    }
  }, [viewHistory])

  const fetchTransporters = async () => {
    try {
      const res = await axios.get(API.FETCH_ALL_TRANSPORTER, { withCredentials: true })
      setTransporterList(res.data?.data || [])
    } catch (error) {
      console.error("Failed to fetch transporters", error)
    }
  }

  const handleChange = (e) => {
    const { name, value, options } = e.target

    if (name === "transporter") {
      const selected = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value)
      setForm({ ...form, [name]: selected })
    } else if (name === "weight" || name === "quantity") {
      setForm({ ...form, [name]: value, isManualTotals: true })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleRemoveMaterial = (indexToRemove) => {
    setForm((prev) => {
      const updatedMaterials = prev.materials.filter((_, idx) => idx !== indexToRemove)

      let weight = prev.weight
      let quantity = prev.quantity

      if (!prev.isManualTotals) {
        weight = updatedMaterials.reduce((acc, mat) => acc + Number(mat.weight || 0), 0).toFixed(2)
        quantity = updatedMaterials.reduce((acc, mat) => acc + Number(mat.quantity || 0), 0)
      }

      return {
        ...prev,
        materials: updatedMaterials,
        weight,
        quantity,
      }
    })
  }

  const handleTransporterSave = (selectedIds) => {
    setForm((prev) => ({ ...prev, transporter: selectedIds }))
    const selectedObjs = transporterList.filter((t) => selectedIds.includes(t._id))
    setSelectedTransporters(selectedObjs)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { from, to } = form.deliveryWindow;
    const { closingDate, biddingStart, biddingEnd } = form;

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const closing = new Date(closingDate);
    const bidStart = new Date(biddingStart);
    const bidEnd = new Date(biddingEnd);

    // --- VALIDATION START ---
    if (fromDate > toDate) {
      toast.error("Delivery 'From' date must be before 'To' date.");
      setLoading(false);
      return;
    }

    if (closing < fromDate || closing > toDate) {
      toast.error("Closing Date must be within the Delivery Window.");
      setLoading(false);
      return;
    }

    if (bidStart < fromDate || bidStart > toDate) {
      toast.error("Bidding Start must be within the Delivery Window.");
      setLoading(false);
      return;
    }

    if (bidEnd < fromDate || bidEnd > toDate) {
      toast.error("Bidding End must be within the Delivery Window.");
      setLoading(false);
      return;
    }

    if (bidStart > bidEnd) {
      toast.error("Bidding Start cannot be after Bidding End.");
      setLoading(false);
      return;
    }

    if (form.materials.length > 0 && (!form.weight || !form.quantity)) {
      toast.warning("Please enter total weight and quantity.");
      setLoading(false);
      return;
    }

    const payload = {
      deliveryWindow: {
        from: form.deliveryWindow.from,
        to: form.deliveryWindow.to,
      },
      closeDate: form.closingDate,
      biddingStart: form.biddingStart,
      biddingEnd: form.biddingEnd,
      dispatchLocation: form.dispatchLocation,
      address: form.address,
      pincode: form.pincode,
      projectName: form.projectName,
      projectCode: form.projectCode,
      purchaseOrder: form.purchaseOrder,
      projectRemark: form.projectRemark,
      totalWeight: form.weight ? Number.parseFloat(form.weight) : null,
      totalQuantity: form.quantity ? Number.parseInt(form.quantity) : null,
      remarks: form.remarks,
      transporters: form.transporter,
      materials: form.materials.map((mat) => ({
        material: mat.item,
        subMaterial: mat.subItem || null,
        weight: Number.parseFloat(mat.weight),
        quantity: Number.parseInt(mat.quantity),
      })),
    }

    try {
      const response = await axios.post(`${API.CREATE_TENDER}`, payload, {
        withCredentials: true,
      })
      setTenderHistories((prev) => [response.data, ...prev])
      toast.success("Tender submitted successfully!")

      setForm({
        deliveryWindow: { from: "", to: "" },
        closingDate: "",
        biddingStart: "",
        biddingEnd: "",
        dispatchLocation: "",
        address: "",
        pincode: "",
        projectName: "",
        projectCode: "",
        purchaseOrder: "",
        projectRemark: "",
        materials: [],
        weight: "",
        quantity: "",
        remarks: "",
        transporter: [],
        isManualTotals: false,
      })

      setSelectedTransporters([])

    } catch (error) {
      const errMessage = error?.response?.data?.message || "Something went wrong. Please try again."
      toast.error(errMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(API.LOGOUT_USER, {}, { withCredentials: true })
      dispatch(logout())
      toast.success("Logged out successfully!")
    } catch (err) {
      console.error("Logout failed:", err)
      toast.error("Logout failed. Please try again.")
    } finally {
      navigate("/signin")
    }
  }


  const navbarActions = (
    <button
      onClick={() => setViewHistory(!viewHistory)}
      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
    >
      {viewHistory ? (
        <>
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </>
      ) : (
        <>
          <History className="h-4 w-4" /> Tenders History
        </>
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-200">
      <Navbar title="RR Dashboard" userName={userName || "RR User"} actions={navbarActions} onLogout={handleLogout} />

      <div className="py-8 px-4 max-w-6xl mx-auto">
        {viewHistory ? (
          <TenderHistoryAccordion tenderHistories={tenderHistories} transporterList={transporterList} fetchTenderHistory={fetchTenderHistory} />
        ) : (
          <TenderForm
            form={form}
            setForm={setForm}
            handleChange={handleChange}
            handleSend={handleSend}
            setShowMaterialModal={setShowMaterialModal}
            setShowTransporterModal={setShowTransporterModal}
            handleRemoveMaterial={handleRemoveMaterial}
            selectedTransporters={selectedTransporters}
            loading={loading}
          />
        )}
      </div>

      {showMaterialModal && (
        <MaterialModal
          close={() => setShowMaterialModal(false)}
          onAdd={(newMaterial) => {
            setForm((prev) => {
              const updatedMaterials = [...prev.materials, newMaterial]
              let weight = prev.weight
              let quantity = prev.quantity

              if (!prev.isManualTotals) {
                weight = updatedMaterials.reduce((sum, mat) => sum + Number.parseFloat(mat.weight || 0), 0).toFixed(2)
                quantity = updatedMaterials.reduce((sum, mat) => sum + Number.parseInt(mat.quantity || 0), 0)
              }

              return {
                ...prev,
                materials: updatedMaterials,
                weight,
                quantity,
              }
            })
          }}
        />
      )}

      {showTransporterModal && (
        <TransporterModal
          selected={form.transporter}
          onClose={() => setShowTransporterModal(false)}
          onSave={handleTransporterSave}
          setTransporterList={setTransporterList}
        />
      )}
    </div>
  )
}

export default RRDashboardPage