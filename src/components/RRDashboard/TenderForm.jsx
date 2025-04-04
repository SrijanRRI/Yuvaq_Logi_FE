import React from "react"

const TenderForm = ({ form, handleChange, handleSend, handleRemoveMaterial, setShowMaterialModal, setShowTransporterModal }) => {
    return (
        <form
            onSubmit={handleSend}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-lg ring-1 ring-gray-100"
        >
            {/* Delivery Date */}
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Date of Delivery</label>
                <input
                    type="date"
                    name="deliveryDate"
                    value={form.deliveryDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>

            {/* Closing Date */}
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Date of Closing Tender</label>
                <input
                    type="date"
                    name="closingDate"
                    value={form.closingDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>

            {/* Dispatch Location */}
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Dispatch Location</label>
                <input
                    type="text"
                    name="dispatchLocation"
                    value={form.dispatchLocation}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>

            {/* Address */}
            <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Address</label>
                <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>

            {/* Pincode */}
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Pin Code</label>
                <input
                    type="number"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>

            {/* Material Section */}
            <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Material Details</label>
                <button
                    type="button"
                    onClick={() => setShowMaterialModal(true)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg text-left bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500"
                >
                    + Add Material
                </button>

                {form.materials.length > 0 && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-md font-semibold mb-3 text-indigo-700">Added Materials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {form.materials.map((mat, index) => (
                                <div
                                    key={index}
                                    className="border p-3 rounded-lg bg-white flex justify-between items-start shadow-sm"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">{mat.item}</p>
                                        {mat.subItem && <p className="text-sm text-gray-500">➝ {mat.subItem}</p>}
                                        <p className="text-sm text-gray-700">{mat.weight}kg × {mat.quantity} pcs</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMaterial(index)}
                                        className="text-red-500 hover:text-red-700 text-lg"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Totals */}
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Total Weight <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Total Quantity <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Remarks */}
            <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Remarks (Optional)</label>
                <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Transporters */}
            <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Select Transporters</label>
                <button
                    type="button"
                    onClick={() => setShowTransporterModal(true)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg text-left bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500"
                >
                    + Choose Transporters
                </button>

                {form.transporter.length > 0 && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-md font-semibold mb-2 text-indigo-700">Selected Transporters</h3>
                        <ul className="list-disc ml-6 text-gray-700 space-y-1 text-sm">
                            {form.transporter.map((name, idx) => (
                                <li key={idx}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="col-span-2 text-right">
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                >
                    Send Tender
                </button>
            </div>
        </form>

    )
}

export default TenderForm
