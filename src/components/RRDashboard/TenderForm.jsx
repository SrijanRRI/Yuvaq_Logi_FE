import React from "react"

const TenderForm = ({ form, handleChange, handleSend, handleRemoveMaterial, setShowMaterialModal, setShowTransporterModal }) => {
  return (
    <form onSubmit={handleSend} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label className="block font-medium mb-1">Date of Delivery</label>
        <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
      </div>
      <div>
        <label className="block font-medium mb-1">Date of Closing Tender</label>
        <input type="date" name="closingDate" value={form.closingDate} onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
      </div>
      <div>
        <label className="block font-medium mb-1">Dispatch Location</label>
        <input type="text" name="dispatchLocation" value={form.dispatchLocation} onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
      </div>
      <div className="col-span-2">
        <label className="block font-medium mb-1">Address</label>
        <textarea name="address" value={form.address} onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
      </div>
      <div>
        <label className="block font-medium mb-1">Pin Code</label>
        <input type="number" name="pincode" value={form.pincode} onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
      </div>
      <div className="col-span-2">
        <label className="block font-medium mb-1">Material Details</label>
        <button
          type="button"
          onClick={() => setShowMaterialModal(true)}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg text-left bg-gray-100 hover:bg-gray-200"
        >
          + Add Material
        </button>
        {form.materials.length > 0 && (
          <div className="mt-4 bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Added Materials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {form.materials.map((mat, index) => (
                <div key={index} className="border p-4 rounded-lg bg-gray-50 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg text-gray-800">{mat.item}</p>
                    {mat.subItem && <p className="text-gray-600 text-medium">➝ {mat.subItem}</p>}
                    <p className="text-sm text-gray-700">{mat.weight}kg × {mat.quantity} pcs</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(index)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block font-medium mb-1">Total Weight <span className="text-red-500">*</span> </label>
        <input type="number" name="weight" value={form.weight} onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg" />
      </div>
      <div>
        <label className="block font-medium mb-1">Total Quantity <span className="text-red-500">*</span> </label>
        <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg" />
      </div>
      <div className="col-span-2">
        <label className="block font-medium mb-1">Remarks (Optional)</label>
        <textarea name="remarks" value={form.remarks} onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg" />
      </div>
      <div className="col-span-2">
        <label className="block font-medium mb-1">Select Transporters</label>
        <button
          type="button"
          onClick={() => setShowTransporterModal(true)}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg text-left bg-gray-100 hover:bg-gray-200"
        >
          + Choose Transporters
        </button>
        {form.transporter.length > 0 && (
          <div className="mt-4 bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Selected Transporters</h3>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              {form.transporter.map((name, idx) => (
                <li key={idx}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="col-span-2 text-right">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Send Tender
        </button>
      </div>
    </form>
  )
}

export default TenderForm
