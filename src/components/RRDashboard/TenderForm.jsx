import {
  Calendar,
  MapPin,
  Package,
  FileText,
  Truck,
  Users,
  Plus,
  Trash2,
  Send,
  Briefcase,
} from "lucide-react";

const TenderForm = ({
  form,
  setForm,
  handleChange,
  handleSend,
  handleRemoveMaterial,
  setShowMaterialModal,
  setShowTransporterModal,
  selectedTransporters,
  loading,
}) => {
  return (
    <form
      onSubmit={handleSend}
      className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
    >
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Package className="h-6 w-6 text-emerald-600" />
        Create New Tender
      </h1>

      {/* Delivery Window & Closing Date */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Delivery Window
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                From
              </label>
              <input
                type="date"
                name="deliveryStart"
                value={form.deliveryWindow.from}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    deliveryWindow: {
                      ...prev.deliveryWindow,
                      from: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                To
              </label>
              <input
                type="date"
                name="deliveryEnd"
                value={form.deliveryWindow.to}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    deliveryWindow: {
                      ...prev.deliveryWindow,
                      to: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Closing Date
          </h2>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tender Closing Date
            </label>
            <input
              type="date"
              name="closingDate"
              value={form.closingDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bidding Start
            </label>
            <input
              type="datetime-local"
              name="biddingStart"
              value={form.biddingStart || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bidding End
            </label>
            <input
              type="datetime-local"
              name="biddingEnd"
              value={form.biddingEnd || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="pt-4 border-t border-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-emerald-600" />
          Project Details
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="projectName"
              value={form.projectName || ""}
              onChange={handleChange}
              placeholder="Enter project name"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Code
            </label>
            <input
              type="text"
              name="projectCode"
              value={form.projectCode || ""}
              onChange={handleChange}
              placeholder="Enter project code"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Purchase Order
            </label>
            <input
              type="text"
              name="purchaseOrder"
              value={form.purchaseOrder || ""}
              onChange={handleChange}
              placeholder="Enter purchase order"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Remark
            </label>
            <textarea
              name="projectRemark"
              value={form.projectRemark || ""}
              onChange={handleChange}
              placeholder="Enter project remarks or additional information"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-[60px]"
            />
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="pt-4 border-t border-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          Dispatch Location Details
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="dispatchLocation"
              value={form.dispatchLocation}
              onChange={handleChange}
              placeholder="Enter location name"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full address"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-[38px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pincode
            </label>
            <input
              type="number"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="Enter pincode"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Materials Section */}
      <div className="pt-4 border-t border-slate-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            Materials
          </h2>
          <button
            type="button"
            onClick={() => setShowMaterialModal(true)}
            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors duration-200 flex items-center gap-1.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Material
          </button>
        </div>

        {form.materials.length > 0 ? (
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="px-4 py-2 text-left rounded-l-md">
                      Material
                    </th>
                    <th className="px-4 py-2 text-left">Sub Item</th>
                    <th className="px-4 py-2 text-right">Weight (Kg)</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-center rounded-r-md">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {form.materials.map((material, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } hover:bg-slate-100 transition-colors duration-150`}
                    >
                      <td className="px-4 py-2 font-medium">{material.item}</td>
                      <td className="px-4 py-2">{material.subItem || "-"}</td>
                      <td className="px-4 py-2 text-right">
                        {material.weight}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {material.quantity}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(index)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Weight (Kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="Total weight"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="Total quantity"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center mb-4">
            <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No materials added yet</p>
            <button
              type="button"
              onClick={() => setShowMaterialModal(true)}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Material
            </button>
          </div>
        )}
      </div>

      {/* Transporters Section */}
      <div className="pt-4 border-t border-slate-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-600" />
            Transporters
          </h2>
          <button
            type="button"
            onClick={() => setShowTransporterModal(true)}
            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors duration-200 flex items-center gap-1.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Select Transporters
          </button>
        </div>

        {selectedTransporters.length > 0 ? (
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedTransporters.map((transporter) => (
                <div
                  key={transporter._id}
                  className="bg-white px-3 py-1.5 rounded-md border border-slate-200 text-sm flex items-center gap-1.5"
                >
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  {transporter.name || transporter.email}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center mb-4">
            <Truck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No transporters selected</p>
            <button
              type="button"
              onClick={() => setShowTransporterModal(true)}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Select Transporters
            </button>
          </div>
        )}
      </div>

      {/* Remarks */}
      <div className="pt-4 border-t border-slate-200 mb-8">
        <label className="text-lg font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          Remarks
        </label>
        <textarea
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          placeholder="Add any additional information or special instructions"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[100px]"
        ></textarea>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Sending...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" /> Send Tender
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TenderForm;
