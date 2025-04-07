import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../API";

export const TransporterModal = ({ selected, onClose, onSave, setTransporterList: updateParentTransporterList }) => {
  const [transporterList, setTransporterList] = useState([]);
  const [localSelection, setLocalSelection] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch transporters and initialize local selection
    const fetchTransporters = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API.FETCH_ALL_TRANSPORTER}`, {
          withCredentials: true,
        });

        // console.log(response.data);
        // console.log(response.data.data);

        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];
          
          setTransporterList(data);
          updateParentTransporterList?.(data);

      } catch (error) {
        console.error("Failed to fetch transporters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransporters();
    setLocalSelection(selected || []);
  }, [selected]);

  const handleCheckboxChange = (transporter) => {
    setLocalSelection((prev) =>
      prev.includes(transporter)
        ? prev.filter((item) => item !== transporter)
        : [...prev, transporter]
    );
  };

  const handleSave = () => {
    onSave(localSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Select Transporters</h2>
        <div className="space-y-2 min-h-[100px] flex flex-col justify-center">
          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
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
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          ) : transporterList.length > 0 ? (
            transporterList.map((transporter) => (
              <label key={transporter._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSelection.includes(transporter._id)}
                  onChange={() => handleCheckboxChange(transporter._id)}
                  className="accent-blue-600"
                />
                <span>{transporter.name || transporter.email}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">No transporters found.</p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
