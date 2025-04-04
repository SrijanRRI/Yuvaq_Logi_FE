import React, { useState } from "react";

const TenderHistoryAccordion = ({ tenderHistories = [] }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [confirmedIdxMap, setConfirmedIdxMap] = useState({});
  const [finalPricesMap, setFinalPricesMap] = useState({});

  const toggleResponses = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
    setEditingIdx(null);
    setPriceInput("");
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
          const confirmedIdx = confirmedIdxMap[idx];
          const finalPrices = finalPricesMap[idx] || {};

          return (
            <div key={idx} className="border rounded-xl mb-6 p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{tender.deliveryDate} - {tender.dispatchLocation}</p>
                  <p className="text-sm text-gray-600">{tender.address} ({tender.pincode})</p>
                  <p className="text-sm text-gray-600">Remarks: {tender.remarks || "None"}</p>
                </div>
                <button
                  onClick={() => toggleResponses(idx)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {openIdx === idx ? "Hide Responses" : "Show Responses"}
                </button>
              </div>

              {openIdx === idx && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-md mb-2">Materials</h4>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {tender.materials.map((mat, i) => (
                        <li key={i}>
                          {mat.item} {mat.subItem && `(${mat.subItem})`} - {mat.weight}kg × {mat.quantity} pcs
                        </li>
                      ))}
                    </ul>
                  </div>

                  <h4 className="text-lg font-semibold mb-3">Transporter Responses</h4>
                  {tender.responses && tender.responses.length > 0 ? (
                    <div className="bg-white p-4 rounded-lg shadow-inner">
                      {tender.responses.map((res, rIdx) => {
                        const uniqueKey = `${idx}-${rIdx}`;
                        const isEditing = editingIdx === uniqueKey;
                        const isDimmed = confirmedIdx !== undefined && confirmedIdx !== rIdx;

                        return (
                          <div
                            key={rIdx}
                            className={`border p-4 rounded mb-4 transition duration-300 
                              ${isDimmed ? "opacity-50 grayscale" : "bg-gray-50 border-gray-300"}`}
                          >
                            <p><strong>Customer:</strong> {res.customerName}</p>
                            <p><strong>Price:</strong> ₹{res.price}</p>
                            <p><strong>Vehicle No:</strong> {res.vehicleNo}</p>
                            <p><strong>Attachments:</strong> {res.attachments.join(", ")}</p>

                            {finalPrices[rIdx] ? (
                              <p className="mt-2 text-green-700 font-semibold">
                                Final Deal Price: ₹{finalPrices[rIdx]}
                              </p>
                            ) : isEditing ? (
                              <div className="mt-3 flex gap-2 items-center">
                                <input
                                  type="number"
                                  value={priceInput}
                                  onChange={(e) => setPriceInput(e.target.value)}
                                  className="border px-3 py-1 rounded w-40"
                                  placeholder="Final Price"
                                />
                                <button
                                  onClick={() => handleDone(idx, rIdx)}
                                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Done
                                </button>
                              </div>
                            ) : (
                              confirmedIdx === undefined && (
                                <>
                                  <p className="text-md text-red-500 mt-1">
                                    * Please enter the final price after negotiation before confirming.
                                  </p>
                                  <button
                                    onClick={() => handleConfirm(idx, rIdx)}
                                    className="mt-3 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                  >
                                    Confirm Final Price
                                  </button>
                                </>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No responses yet.</p>
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
