"use client"

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
  Scale,
  Info,
  ChevronDown,
  Check,
} from "lucide-react"
import { useState } from "react"

import FullScreenLoader from "../../components/FullScreenLoader"

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
  formDisabled,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const unitOptions = [
    { value: "Per MT", label: "Per MT", description: "Price per metric ton" },
    { value: "Per Tender", label: "Per Tender", description: "Fixed price for entire tender" },
  ]

  const handleUnitSelect = (value) => {
    const event = {
      target: {
        name: "maxBidUnit",
        value: value,
      },
    }
    handleChange(event)
    setIsDropdownOpen(false)
  }

  const selectedOption = unitOptions.find((option) => option.value === form.maxBidUnit)

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Create New Tender
          </h1>
          <p className="mt-1 opacity-80">Fill in the details to create a new tender request</p>
        </div>

        {loading ? (
          <FullScreenLoader />
        ) : (
          <form onSubmit={handleSend} className="p-6">
            <fieldset disabled={formDisabled} className="space-y-8">
              {/* Delivery Window & Closing Date */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Delivery Window
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                      <input
                        type="date"
                        name="deliveryStart"
                        value={form.deliveryWindow.from}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            deliveryWindow: {
                              ...prev.deliveryWindow,
                              from: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Closing Date
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tender Closing Date</label>
                    <input
                      type="date"
                      name="closingDate"
                      value={form.closingDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bidding Time */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Bidding Time
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bidding Start</label>
                    <input
                      type="datetime-local"
                      name="biddingStart"
                      value={form.biddingStart || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bidding End</label>
                    <input
                      type="datetime-local"
                      name="biddingEnd"
                      value={form.biddingEnd || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Maximum Bid Amount */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <Scale className="h-5 w-5 text-amber-600" />
                  Maximum Bid Amount
                </h2>
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-slate-500 text-lg">₹</span>
                  </div>
                  <input
                    type="number"
                    name="maxBidAmount"
                    step="1"
                    min="1"
                    value={form.maxBidAmount || ""}
                    onChange={handleChange}
                    placeholder="Enter maximum allowed bid amount"
                    className="w-full pl-8 pr-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg font-medium transition-all duration-200"
                    required
                  />
                </div>

                {/* Enhanced Custom Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit Type</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-white border border-amber-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-2 rounded-lg">
                            <Scale className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            {selectedOption ? (
                              <div>
                                <div className="font-medium text-slate-800">{selectedOption.label}</div>
                                <div className="text-xs text-slate-500">{selectedOption.description}</div>
                              </div>
                            ) : (
                              <div className="text-slate-500">Select Unit Type</div>
                            )}
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                            isDropdownOpen ? "transform rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Dropdown Options */}
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-amber-200 rounded-lg shadow-lg overflow-hidden">
                        {unitOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleUnitSelect(option.value)}
                            className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors duration-150 border-b border-amber-100 last:border-b-0 focus:outline-none focus:bg-amber-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-2 rounded-lg">
                                  <Scale className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800">{option.label}</div>
                                  <div className="text-xs text-slate-500">{option.description}</div>
                                </div>
                              </div>
                              {form.maxBidUnit === option.value && <Check className="h-4 w-4 text-amber-600" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 text-amber-700">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">Enter the maximum amount transporters can quote for this tender.</p>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Project Details
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      name="projectName"
                      value={form.projectName || ""}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Code</label>
                    <input
                      type="text"
                      name="projectCode"
                      value={form.projectCode || ""}
                      onChange={handleChange}
                      placeholder="Enter project code"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Order</label>
                    <input
                      type="text"
                      name="purchaseOrder"
                      value={form.purchaseOrder || ""}
                      onChange={handleChange}
                      placeholder="Enter purchase order"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Remark</label>
                    <textarea
                      name="projectRemark"
                      value={form.projectRemark || ""}
                      onChange={handleChange}
                      placeholder="Enter project remarks or additional information"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-[60px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Dispatch Location Details
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="dispatchLocation"
                      value={form.dispatchLocation}
                      onChange={handleChange}
                      placeholder="Enter location name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-[38px] resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                    <input
                      type="number"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="Enter pincode"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Materials Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    Materials
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowMaterialModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Add Material
                  </button>
                </div>

                {form.materials.length > 0 ? (
                  <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left bg-slate-100 text-slate-700 font-semibold rounded-tl-lg">
                              Material
                            </th>
                            <th className="px-4 py-3 text-left bg-slate-100 text-slate-700 font-semibold">Sub Item</th>
                            <th className="px-4 py-3 text-right bg-slate-100 text-slate-700 font-semibold">
                              Weight (MT)
                            </th>
                            <th className="px-4 py-3 text-right bg-slate-100 text-slate-700 font-semibold">Quantity</th>
                            <th className="px-4 py-3 text-center bg-slate-100 text-slate-700 font-semibold rounded-tr-lg">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.materials.map((material, index) => (
                            <tr
                              key={index}
                              className="border-b border-slate-200 last:border-0 hover:bg-slate-100/50 transition-colors duration-150"
                            >
                              <td className="px-4 py-3 font-medium text-slate-800">{material.item}</td>
                              <td className="px-4 py-3 text-slate-600">{material.subItem || "-"}</td>
                              <td className="px-4 py-3 text-right text-slate-700">{material.weight}</td>
                              <td className="px-4 py-3 text-right text-slate-700">{material.quantity}</td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMaterial(index)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                  title="Remove material"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
                        <label className=" text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                          <Scale className="h-4 w-4 text-emerald-600" />
                          Total Weight (MT)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={form.weight}
                          onChange={handleChange}
                          placeholder="Total weight"
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 text-emerald-800 font-medium transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100 shadow-sm">
                        <label className=" text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-sky-600" />
                          Total Quantity
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={form.quantity}
                          onChange={handleChange}
                          placeholder="Total quantity"
                          className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white/80 text-sky-800 font-medium transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center mb-4">
                    <div className="bg-white rounded-full p-4 inline-flex mb-3 shadow-sm">
                      <Package className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium mb-2">No materials added yet</p>
                    <p className="text-slate-500 text-sm mb-4">
                      Add materials to your tender by clicking the button below
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowMaterialModal(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 inline-flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Material
                    </button>
                  </div>
                )}
              </div>

              {/* Transporters Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    Transporters
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowTransporterModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Select Transporters
                  </button>
                </div>

                {selectedTransporters.length > 0 ? (
                  <div className="bg-slate-50 rounded-xl p-5 mb-4 border border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {selectedTransporters.map((transporter) => (
                        <div
                          key={transporter._id}
                          className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-200"
                        >
                          <div className="bg-emerald-100 p-1.5 rounded-full">
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <span className="font-medium text-slate-700">{transporter.name || transporter.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center mb-4">
                    <div className="bg-white rounded-full p-4 inline-flex mb-3 shadow-sm">
                      <Truck className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium mb-2">No transporters selected</p>
                    <p className="text-slate-500 text-sm mb-4">Select transporters who can bid on this tender</p>
                    <button
                      type="button"
                      onClick={() => setShowTransporterModal(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 inline-flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Select Transporters
                    </button>
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  placeholder="Add any additional information or special instructions"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[120px] transition-all duration-200"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-lg font-medium"
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
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" /> Submit Tender
                    </>
                  )}
                </button>
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  )
}

export default TenderForm
