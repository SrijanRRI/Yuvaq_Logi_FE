import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import API from "../../API";
import axios from "axios";

const TenderHistoryAccordion = ({ tenderHistories = [], transporterList = [] }) => {
    const [openIdx, setOpenIdx] = useState(null);
    const [editingId, setEditingId] = useState(null); // Format: tenderId-responseIdx
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

        if (allResponses[tenderId]) {
            setOpenIdx(idx);
            return;
        }

        try {
            const response = await axios.get(`${API.FETCH_ALL_QUOTATION_FOR_PARTICULAR_TENDER}/${tenderId}`, {
                withCredentials: true,
            });
            // console.log(response);

            setAllResponses((prev) => ({
                ...prev,
                [tenderId]: response.data.quotations,
            }));
            setOpenIdx(idx);
        } catch (error) {
            console.error("Failed to fetch responses:", error);
            alert("Could not load transporter responses. Please try again.");
        }
    };
    // console.log(allResponses);

    const handleConfirm = (tenderId, resIdx) => {
        const finalPrices = finalPricesMap[tenderId] || {};
        setEditingId(`${tenderId}-${resIdx}`);
        setPriceInput(finalPrices[resIdx] || "");
    };

    const handleDone = async (tenderId, resIdx) => {
        const confirm = window.confirm("Are you sure you want to finalize this quotation?");
        if (!confirm) return;
        console.log(tenderId);

        const quotation = allResponses[tenderId][resIdx];
        console.log(quotation);
        console.log(priceInput);

        const quotationId = quotation._id;


        const finalPrice = priceInput;



        try {
            await axios.put(
                `${API.FINALIZE_TENDER}/${tenderId}`, // Assuming correct route
                {
                    quotationId,
                    finalPrice: Number(finalPrice),
                },
                {
                    withCredentials: true,
                }
            );

            setFinalPricesMap((prev) => ({
                ...prev,
                [tenderId]: {
                    ...prev[tenderId],
                    [resIdx]: finalPrice,
                },
            }));

            setConfirmedIdxMap((prev) => ({
                ...prev,
                [tenderId]: resIdx,
            }));

            setEditingId(null);
            alert("Tender finalized successfully!");
        } catch (error) {
            console.error("Error finalizing tender:", error);
            alert("Something went wrong while finalizing. Please try again.");
        }
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Tender History</h2>

            {tenderHistories.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No Tender History Available.</p>
            ) : (
                tenderHistories.map((tender, idx) => {
                    const tenderId = tender._id;
                    const confirmedIdx = confirmedIdxMap[tenderId];
                    const finalPrices = finalPricesMap[tenderId] || [];
                    const responsesForThisTender = allResponses[tenderId] || [];

                    return (
                        <div key={tenderId} className="border rounded-xl mb-6 p-4 shadow-sm bg-gray-50">
                            {/* Summary Box */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 border rounded-xl bg-white shadow-lg ring-1 ring-gray-100">
                                <div className="space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Delivery Date</h4>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {new Date(tender.dateOfDelivery).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Closing Date</h4>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {new Date(tender.closeDate || "N/A").toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Dispatch Location</h4>
                                    <p className="text-md text-gray-700">{tender.dispatchLocation}</p>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Address</h4>
                                    <p className="text-md text-gray-700">{tender.address}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Pincode</h4>
                                    <p className="text-md text-gray-700">{tender.pincode}</p>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <h4 className="text-gray-500 text-sm uppercase">Remarks</h4>
                                    <p className="text-md text-gray-700">{tender.remarks || "None"}</p>
                                </div>
                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                    <h4 className="font-semibold text-md mb-2 text-indigo-700">Materials</h4>
                                    <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                                        {Array.isArray(tender.materials) &&
                                            tender.materials.map((mat, i) => (
                                                <li key={i}>
                                                    {mat.material} {mat.subMaterial && `(${mat.subMaterial})`} - {mat.weight}kg × {mat.quantity} pcs
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-1">
                                    <h4 className="text-sm font-medium text-gray-600">Total Weight</h4>
                                    <p className="text-lg font-bold text-gray-800">
                                        {tender.materials?.reduce(
                                            (acc, mat) => acc + Number(mat.weight || 0) * Number(mat.quantity || 0),
                                            0
                                        )}{" "}
                                        kg
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-1">
                                    <h4 className="text-sm font-medium text-gray-600">Total Quantity</h4>
                                    <p className="text-lg font-bold text-gray-800">
                                        {tender.materials?.reduce((acc, mat) => acc + Number(mat.quantity || 0), 0)} pcs
                                    </p>
                                </div>
                                <div className="md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <h4 className="text-sm font-semibold text-indigo-800 mb-2">Transporters</h4>
                                    {Array.isArray(tender.transporters) && tender.transporters.length > 0 ? (
                                        <ul className="list-disc ml-6 text-sm text-indigo-900 space-y-1">
                                            {tender.transporters.map((_id, i) => (
                                                <li key={i}>{getTransporterName(_id)}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No transporters assigned.</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => toggleResponses(idx, tenderId)}
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

                            {openIdx === idx && (
                                <div className="mt-6">
                                    <h4 className="text-xl font-semibold mb-4 text-indigo-800">Transporter Responses</h4>

                                    {responsesForThisTender.length > 0 ? (
                                        <div className="space-y-4">
                                            {responsesForThisTender.map((res, rIdx) => {
                                                const uniqueKey = `${tenderId}-${rIdx}`;
                                                const isEditing = editingId === uniqueKey;
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
                                                                <p className="text-md font-medium text-gray-700">{res.vehicleNumber}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Attachments</p>
                                                                <p className="text-sm text-gray-700">
                                                                    {res?.files?.length > 0 ? res.files.join(", ") : "No attachments"}
                                                                </p>
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
                                                                        onClick={() => handleDone(tenderId, rIdx)}
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
                                                                            onClick={() => handleConfirm(tenderId, rIdx)}
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
