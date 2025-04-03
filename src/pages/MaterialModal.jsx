import { useState } from "react"
import { AiOutlineClose } from "react-icons/ai"

export const MaterialModal = ({ close, onAdd }) => {
  const [item, setItem] = useState("")
  const [subItem, setSubItem] = useState("")
  const [weight, setWeight] = useState("")
  const [quantity, setQuantity] = useState("")

  const materialOptions = {
    "Steel Pipe": ["MS", "SS", "GI"],
    "Iron Rod": ["6mm", "8mm", "10mm"],
    Sheet: ["Mild", "Hard"],
  }

  const items = Object.keys(materialOptions)
  const subItems = item ? materialOptions[item] : []

  const handleAdd = () => {
    if (!item ) {
      alert("Fill required fields")
      return
    }
    onAdd({ item, subItem, weight, quantity })
    close()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold">Add Material</h2>
          <button
            onClick={close}
            className="text-gray-500 hover:bg-gray-100 rounded-full p-1.5"
            aria-label="Close modal"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-5">
          {/* Material Selection */}
          <div className="space-y-2">
            <label htmlFor="material" className="font-medium">
              Material <span className="text-red-500">*</span>
            </label>
            <select
              id="material"
              className="w-full border rounded px-3 py-2"
              value={item}
              onChange={(e) => {
                setItem(e.target.value)
                setSubItem("") // Reset subitem when material changes
              }}
            >
              <option value="">Select Material</option>
              {items.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Item Selection */}
          {subItems.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="subItem" className="font-medium">
                Sub Item
              </label>
              <select
                id="subItem"
                className="w-full border rounded px-3 py-2"
                value={subItem}
                onChange={(e) => setSubItem(e.target.value)}
              >
                <option value="">Select Sub Item</option>
                {subItems.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Weight & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="weight" className="font-medium">
                Weight (kg) 
              </label>
              <input
                type="number"
                id="weight"
                placeholder="Enter weight"
                className="w-full border rounded px-3 py-2"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="quantity" className="font-medium">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                className="w-full border rounded px-3 py-2"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
              onClick={close}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
              onClick={handleAdd}
            >
              Add Material
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
