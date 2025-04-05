import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import API from "../../API";
import axios from "axios";

const TenderHistoryAccordion = ({ tenderHistories = [], transporterList = [] }) => {
    const [openIdx, setOpenIdx] = useState(null);
    const [editingIdx, setEditingIdx] = useState(null);
    const [priceInput, setPriceInput] = useState("");
    const [confirmedIdxMap, setConfirmedIdxMap] = useState({});
    const [finalPricesMap, setFinalPricesMap] = useState({});
    const [allResponses, setAllResponses] = useState({});

    const getTransporterName = (id) => {
        const found = transporterList.find((t) => t._id === id);
        return found ? found.name || found.email : id;
    };

    const toggleResponses = async (idx, tenderId) => {

        if (openIdx === idx) {
            setOpenIdx(null);
            return;
        }

        setOpenIdx(openIdx === idx ? null : idx);
        setEditingIdx(null);
        setPriceInput("");

        // Fetch quotations only if not already fetched
        if (!allResponses[tenderId]) {
            try {
                const res = await axios.get(`${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`, {
                    withCredentials: true,
                });
                console.log(res.data);
                setAllResponses((prev) => ({ ...prev, [tenderId]: res.data?.data || [] }));
            } catch (error) {
                console.error("Failed to fetch quotations for tender:", tenderId, error);
                setAllResponses((prev) => ({ ...prev, [tenderId]: [] }));
            }
        }
    };

    const handleConfirm = (tenderIdx, resIdx) => {
        setEditingIdx(`${tenderIdx}-${resIdx}`);
        setPriceInput(finalPricesMap[tenderIdx]?.[resIdx] || "");
    };

    const handleDone = (tenderIdx, resIdx) => {
        const confirm = window.confirm("Are you sure you want to finalize this quotation?");
        if (confirm) {
            setFinalPricesMap((prev) => ({
                ...prev,
                [tenderIdx]: {
                    ...prev[tenderIdx],
                    [resIdx]: priceInput,
                },
            }));
            setConfirmedIdxMap((prev) => ({
                ...prev,
                [tenderIdx]: resIdx,
            }));
            setEditingIdx(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Tender History</h2>

            {tenderHistories.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No Tender History Available.</p>
            ) : (
                tenderHistories.map((tender, idx) => {
                    // console.log(tenderHistories)
                    const confirmedIdx = confirmedIdxMap[idx];
                    const finalPrices = finalPricesMap[idx] || {};
                    const responses = allResponses[tender._id] || [];

                    return (
                        <div key={idx} className="border rounded-xl mb-6 p-4 shadow-sm bg-gray-50">
                            {/* Tender Summary Box */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 border rounded-xl bg-white shadow-lg ring-1 ring-gray-100">
                                {/* Section: Dates */}
                                <div className="space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Delivery Date</h4>
                                    <p className="text-lg font-semibold text-gray-800"> {new Date(tender.dateOfDelivery).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Closing Date</h4>
                                    <p className="text-lg font-semibold text-gray-800"> {new Date(tender.closeDate || "N/A").toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                    </p>
                                </div>

                                {/* Section: Location */}
                                <div className="space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Dispatch Location</h4>
                                    <p className="text-md text-gray-700">{tender.dispatchLocation}</p>
                                </div>

                                {/* Section: Address */}
                                <div className="md:col-span-2 space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Address</h4>
                                    <p className="text-md text-gray-700">{tender.address}</p>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Pincode</h4>
                                    <p className="text-md text-gray-700">{tender.pincode}</p>
                                </div>

                                {/* Section: Remarks */}
                                <div className="md:col-span-2 space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Remarks</h4>
                                    <p className="text-md text-gray-700">{tender.remarks || "None"}</p>
                                </div>

                                {/* Divider */}
                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                    <h4 className="font-semibold text-md mb-2 text-indigo-700">Materials</h4>
                                    <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                                        {Array.isArray(tender.materials) && tender.materials.map((mat, i) => (
                                            <li key={i}>
                                                {mat.material} {mat.subMaterial && `(${mat.subMaterial})`} - {mat.weight}kg × {mat.quantity} pcs
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Totals */}
                                <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-1">
                                    <h4 className="text-sm font-medium text-gray-600">Total Weight</h4>
                                    <p className="text-lg font-bold text-gray-800">
                                        {Array.isArray(tender.materials)
                                            ? tender.materials.reduce((acc, mat) => acc + Number(mat.weight || 0), 0)
                                            : 0} kg
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-1">
                                    <h4 className="text-sm font-medium text-gray-600">Total Quantity</h4>
                                    <p className="text-lg font-bold text-gray-800">
                                        {Array.isArray(tender.materials)
                                            ? tender.materials.reduce((acc, mat) => acc + Number(mat.quantity || 0), 0)
                                            : 0} pcs
                                    </p>
                                </div>

                                {/* Transporters */}
                                <div className="md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <h4 className="text-sm font-semibold text-indigo-800 mb-2">Transporters</h4>
                                    {Array.isArray(tender.responses) && tender.transporters.length > 0 ? (
                                        <ul className="list-disc ml-6 text-sm text-indigo-900 space-y-1">
                                            {tender.transporters.map((_id, i) => (
                                                <li key={i}>{getTransporterName(_id)}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No responses yet.</p>
                                    )}
                                </div>
                            </div>



                            {/* Toggle Button */}
                            <button
                                onClick={() => toggleResponses(idx, tender._id)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-full shadow-md hover:bg-indigo-700 hover:shadow-lg transition duration-200"
                            >
                                {openIdx === idx ? (
                                    <>
                                        <FaChevronUp className="text-sm" /> Hide Responses
                                    </>
                                ) : (
                                    <>
                                        <FaChevronDown className="text-sm" /> Show Responses
                                    </>
                                )}
                            </button>

                            {/* Accordion Details */}
                            {openIdx === idx && (
                                <div className="mt-6">
                                    <h4 className="text-xl font-semibold mb-4 text-indigo-800">Transporter Responses</h4>

                                    {responses.length > 0 ? (
                                        <div className="space-y-4">
                                            {responses.map((res, rIdx) => {
                                                const uniqueKey = `${idx}-${rIdx}`;
                                                const isEditing = editingIdx === uniqueKey;
                                                const isDimmed = confirmedIdx !== undefined && confirmedIdx !== rIdx;

                                                return (
                                                    <div
                                                        key={rIdx}
                                                        className={`border-l-4 p-5 rounded-lg shadow-md transition duration-300 ${isDimmed ? "border-gray-300 bg-gray-100 opacity-60" : "border-indigo-500 bg-white"}`}
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm text-gray-500">Transporter</p>
                                                                <p className="text-lg font-semibold text-gray-800">{res.customerName}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Price</p>
                                                                <p className="text-lg font-semibold text-green-700">₹{res.price}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Vehicle No</p>
                                                                <p className="text-md font-medium text-gray-700">{res.vehicleNo}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Attachments</p>
                                                                <p className="text-sm text-gray-700">{res.attachments.join(", ")}</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4">
                                                            {finalPrices[rIdx] ? (
                                                                <div className="text-green-700 font-semibold text-md bg-green-50 p-3 rounded-md border border-green-200">
                                                                    Final Deal Price: ₹{finalPrices[rIdx]}
                                                                </div>
                                                            ) : isEditing ? (
                                                                <div className="mt-3 flex gap-3 items-center">
                                                                    <input
                                                                        type="number"
                                                                        value={priceInput}
                                                                        onChange={(e) => setPriceInput(e.target.value)}
                                                                        className="border border-gray-300 px-3 py-2 rounded w-40 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                                        placeholder="Final Price"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleDone(idx, rIdx)}
                                                                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                                                                    >
                                                                        Done
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                confirmedIdx === undefined && (
                                                                    <div className="mt-3 space-y-2">
                                                                        <p className="text-sm text-red-500">
                                                                            * Please enter the final price after negotiation before confirming.
                                                                        </p>
                                                                        <button
                                                                            onClick={() => handleConfirm(idx, rIdx)}
                                                                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                                                        >
                                                                            Confirm Final Price
                                                                        </button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-2 italic">No responses yet.</p>
                                    )}
                                </div>
                            )}

                        </div>
                    );
                })
            )}
        </div>
    );
};

export default TenderHistoryAccordion;
