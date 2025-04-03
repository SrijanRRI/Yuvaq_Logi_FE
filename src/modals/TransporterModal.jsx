import React, { useState, useEffect } from 'react';

export const TransporterModal = ({ selected, onClose, onSave }) => {
    const transporterList = [
        "RR Logistics",
        "ABC Transports",
        "XYZ Freight",
        "FastTrack Movers"
    ];

    const [localSelection, setLocalSelection] = useState([]);

    useEffect(() => {
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
                <div className="space-y-2">
                    {transporterList.map((transporter, idx) => (
                        <label key={idx} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={localSelection.includes(transporter)}
                                onChange={() => handleCheckboxChange(transporter)}
                                className="accent-blue-600"
                            />
                            <span>{transporter}</span>
                        </label>
                    ))}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
