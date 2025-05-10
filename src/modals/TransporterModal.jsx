import { useState, useEffect } from "react";
import { Truck, X } from "lucide-react";
import axios from "axios";
import API from "../API";
import { ModalHeader } from "./TransporterModal/ModalHeader";
import { TransporterList } from "./TransporterModal/TransporterList";
import { ModalFooter } from "./TransporterModal/ModalFooter";



const TransporterModal = ({ selected, onClose, onSave, setTransporterList: updateParentTransporterList }) => {
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

        const data = Array.isArray(response.data.data) ? response.data.data : [];

        setTransporterList(data);
        updateParentTransporterList?.(data);

        //  Auto-select all if no initial selection
        if (!selected || selected.length === 0) {
          const allIds = data.map((t) => t._id);
          setLocalSelection(allIds);
        } else {
          setLocalSelection(selected);
        }
      } catch (error) {
        console.error("Failed to fetch transporters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransporters();
  }, [selected, updateParentTransporterList]);

  const handleCheckboxChange = (transporterId) => {
    setLocalSelection((prev) =>
      prev.includes(transporterId) 
        ? prev.filter((item) => item !== transporterId) 
        : [...prev, transporterId]
    );
  };

  const toggleSelectAll = () => {
    if (localSelection.length === transporterList.length) {
      setLocalSelection([]); // Unselect all
    } else {
      setLocalSelection(transporterList.map((t) => t._id));
    }
  };

  const handleSave = () => {
    onSave(localSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <ModalHeader onClose={onClose} />
        
        <TransporterList
          transporterList={transporterList}
          localSelection={localSelection}
          loading={loading}
          toggleSelectAll={toggleSelectAll}
          handleCheckboxChange={handleCheckboxChange}
        />
        
        <ModalFooter onClose={onClose} handleSave={handleSave} />
      </div>
    </div>
  );
};

export default TransporterModal;