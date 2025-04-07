import { useEffect, useState } from "react";
import { ImCross } from "react-icons/im";
import { PiCheckFatFill } from "react-icons/pi";
import { TbTruckDelivery } from "react-icons/tb";
import { IoIosHome } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { BiSolidBox } from "react-icons/bi";
import { FaTools } from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import API from "../API";
import { ConfirmationModal } from "../modals/ConfirmationModal";
import axios from "axios";

const TransporterDashboardPage = () => {
  const [tenders, setTenders] = useState([]);
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [responseForm, setResponseForm] = useState({
    price: "",
    vehicleNo: "",
    attachments: [],
  });
  const [view, setView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerName = "Customer Name"; // Replace with actual name if available
  const navigate = useNavigate();

  const [confirmDialog, setConfirmDialog] = useState(null);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);


  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await fetch(`${API.FETCH_ALL_TENDERS}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // This line ensures cookies are sent with request
        });
        const data = await res.json();
        console.log("fetch all tenders : ", data.data);

        setTenders(data.data); // Change this if your API returns nested fields (e.g., data.tenders)
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load tenders.");
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  const handleReject = (id) => {
    setConfirmDialog({
      message: "Are you sure you want to reject this tender?",
      onConfirm: () => {
        setTenders((prev) => prev.filter((t) => t.id !== id));
        toast.info("Tender rejected.");
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleApprove = (tender) => {
    setSelectedTender(tender);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    setResponseForm({
      ...responseForm,
      attachments: e.target.files?.[0] ? [e.target.files[0]] : [],
    });
  };

  const handleResponseChange = (e) => {
    setResponseForm({ ...responseForm, [e.target.name]: e.target.value });
  };

  const handleSubmitResponse = async () => {
    if (!responseForm.price || !responseForm.vehicleNo) {
      // alert("Price and vehicle number are required.");
      toast.warning("Price and vehicle number are required.");

      return;
    }

    const formData = new FormData();
    formData.append("price", responseForm.price);
    formData.append("vehicleNumber", responseForm.vehicleNo);

    if (responseForm.attachments.length > 0) {
      formData.append("file", responseForm.attachments[0]); //  just one file
    }

    console.log([...formData.entries()]);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API.SUBMIT_QUOTATION}/${selectedTender._id}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok) {
        // alert("Quotation submitted successfully!");
        toast.success("Quotation submitted successfully!");

        setHistory((prev) => [
          ...prev,
          {
            rrName: selectedTender.rrName,
            price: responseForm.price,
            vehicleNo: responseForm.vehicleNo,
            attachments:
              result.data.files?.map((f) => f.originalName || f.url) || [],
            dispatchLocation: selectedTender.dispatchLocation,
            materials: selectedTender.materials.map((m) => ({
              item: m.material,
              subItem: m.subMaterial,
              weight: m.weight,
              quantity: m.quantity,
            })),
          },
        ]);

        setShowModal(false);
        setResponseForm({ price: "", vehicleNo: "", attachments: [] });
      } else {
        // alert(result.message || "Failed to submit quotation.");
        toast.error(result.message || "Failed to submit quotation.");
      }
    } catch (error) {
      console.error("Quotation Submit Error:", error);
      // alert("An error occurred while submitting your quotation.");
      toast.error("An error occurred while submitting your quotation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearHistory = () => {
    setConfirmDialog({
      message: "Are you sure you want to delete all history?",
      onConfirm: () => {
        setHistory([]);
        toast.info("All history cleared.");
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleDeleteHistoryItem = (index) => {
    setConfirmDialog({
      message: "Delete this history entry?",
      onConfirm: () => {
        setHistory((prev) => prev.filter((_, idx) => idx !== index));
        toast.success("History entry deleted.");
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleLogout = () => {
    navigate("/signin");
  };

  const handleToggleView = async () => {
    if (!view) {
      // Switching to history view
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await axios.get(API.HISTORY_FOR_QUOTATION_QUOTE, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("History response:", res.data);
        setHistory(res.data.data || []);
      } catch (err) {
        console.error("Failed to load history:", err);
        if (err.response) {
          console.error("Server responded with:", err.response.status, err.response.data);
        } else if (err.request) {
          console.error("No response received:", err.request);
        }
        setHistoryError("Failed to load submission history.");
      } finally {
        setHistoryLoading(false);
      }
    }
    setView((prev) => !prev);
  };



  const navbarActions = (
    <button
      onClick={handleToggleView}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      {view ? "Back to Dashboard" : "View History"}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        title="Transporter Dashboard"
        userName={customerName}
        actions={navbarActions}
        onLogout={handleLogout}
      />

      <div className="py-6 sm:py-10 px-4 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-600">Loading tenders...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : view ? (
          historyLoading ? (
            <div className="text-center text-gray-600">Loading history...</div>
          ) : historyError ? (
            <div className="text-center text-red-600">{historyError}</div>
          ) : history.length > 0 ? (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Submitted History</h3>
                <button
                  onClick={handleClearHistory}
                  className="text-red-600 hover:text-white text-sm border-red-600 border p-2 hover:bg-red-600 rounded-lg"
                >
                  Delete All
                </button>
              </div>
              <div className="grid gap-4">
                {history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded shadow border relative"
                  >
                    <button
                      onClick={() => handleDeleteHistoryItem(idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Delete Entry"
                    >
                      <ImCross className="text-sm" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <p><strong>RR User:</strong> {entry.rrName}</p>
                      <p><strong>Price:</strong> ₹{entry.price}</p>
                      <p><strong>Vehicle No:</strong> {entry.vehicleNo}</p>
                      <p><strong>Location:</strong> {entry.dispatchLocation}</p>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>
                        <strong>Materials:</strong>{" "}
                        {entry.materials
                          ?.map((m) => `${m.item} (${m.subItem || "-"}) x ${m.quantity}pcs, ${m.weight}kg`)
                          .join("; ")}
                      </p>
                      <p className="mt-1">
                        <strong>Attachments:</strong>{" "}
                        {entry.attachments?.length > 0
                          ? entry.attachments.map((f) => (typeof f === "string" ? f : f.name)).join(", ")
                          : "None"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 h-40 flex items-center justify-center">
              No submission history available.
            </div>
          )
        ) : tenders.length === 0 ? (
          <div className="text-center text-gray-500 h-40 flex items-center justify-center">
            No pending tenders.
          </div>
        ) : (
          <div className="space-y-6">
            {tenders.map((tender) => (
              <div
                key={tender._id}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Tender from {tender.rrName}
                  {tender.hasQuoted && (
                    <span className="ml-2 text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                      Already Quoted
                    </span>
                  )}
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><BiSolidBox className="inline mr-1 text-green-500" /> <strong>Delivery:</strong>  {new Date(tender.dateOfDelivery).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</p>
                  <p><FaLocationDot className="inline mr-1 text-red-500" /> <strong>Location:</strong> {tender.dispatchLocation}</p>
                  <p><IoIosHome className="inline mr-1 text-blue-500" /> <strong>Address:</strong> {tender.address}</p>
                  <p><IoIosHome className="inline mr-1 text-blue-500" /> <strong>Pincode:</strong> {tender.pincode}</p>
                </div>
                <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-700"><FaTools className="inline mr-2" />Materials</h4>
                  <div className="overflow-x-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="p-2">Material</th>
                          <th className="p-2">Sub Item</th>
                          <th className="p-2">Weight</th>
                          <th className="p-2">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tender.materials.map((m) => (
                          <tr key={m._id} className="border-t">
                            <td className="p-2">{m.material}</td>
                            <td className="p-2">{m.subMaterial || "-"}</td>
                            <td className="p-2">{m.weight} kg</td>
                            <td className="p-2">{m.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {tender.remarks && (
                  <p className="mt-3 text-sm bg-gray-100 p-2 rounded">
                    <MdLibraryBooks className="inline mr-1 text-purple-500" />
                    <strong> Remarks:</strong> {tender.remarks}
                  </p>
                )}
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => handleReject(tender.id)}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
                  >
                    <ImCross className="text-lg" /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(tender)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <PiCheckFatFill className="text-xl" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              Tender Approval for {selectedTender.rrName}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1 text-sm">
                  Price (₹)
                </label>
                <input
                  name="price"
                  value={responseForm.price}
                  onChange={handleResponseChange}
                  type="number"
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-sm">
                  Vehicle Detail
                </label>
                <input
                  name="vehicleNo"
                  value={responseForm.vehicleNo}
                  onChange={handleResponseChange}
                  type="text"
                  placeholder="Enter vehicle number"
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-sm">
                  Attachments
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload relevant documents (optional)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-100 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  </>
                ) : (
                  "Submit Response"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <ConfirmationModal
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
};

export default TransporterDashboardPage;
