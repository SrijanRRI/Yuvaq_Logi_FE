import { useState } from "react"
import { AiOutlineClose } from "react-icons/ai"

export const MaterialModal = ({ close, onAdd }) => {
  const [item, setItem] = useState("")
  const [subItem, setSubItem] = useState("")
  const [weight, setWeight] = useState("")
  const [quantity, setQuantity] = useState("")

  const materialOptions = {
    "PG tower HT": ["765kV"],
    "PG tower MS": ["765kV"],
    "Non PG HT tower": ["132kV", "220kV", "400kV", "765kV"],
    "Non PG MS tower": ["132kV", "220kV", "400kV", "765kV"],
    "Portal": [],
    "TTC": [],
    "MAST": [],
    "SPS": [],
    "Octagonal Poles": [],
    "Conical Poles": [],
    "Conical Poles PU Paint": [],
    "HM": [],
    "SM": [],
    "Galvalume": [],
    "HDG": [],
    "Pipe": [
      "15nb to 80nb",
      "100nb to 150nb (non casing)",
      "125nb & 150nb casing",
      "168OD to 200nb (non casing)",
      "168OD to 175nb casing"
    ],
    "Angle": [
      "70", "80", "90", "100", "110", "120",
      "130(8,15,16mm)", "130(10,12,14mm)",
      "150(10,12,14,15,16,20mm)", "150(18mm)",
      "200(12,14,15,16,18,20,22,24mm)", "200 (25mm)",
      "130(8,15,16mm) (PG)", "130(10,12,14mm) (PG)",
      "150(10,12,14,15,16,20mm) (PG)", "150(18mm) (PG)",
      "200(12,14,15,16,18,20,22,24mm) (PG)", "200 (25mm) (PG)",
      "70 (PG)", "80 (PG)", "90 (PG)", "100 (PG)", "110 (PG)", "120 (PG)"
    ],
    "Channel": [
      "150X75", "175X75", "200X75",
      "150X75 (PG)", "175X75 (PG)", "200X75 (PG)"
    ],
    "MS Beam": [
      "152X152 (10-13m)", "152X152 (16m)",
      "100X116 (10-13m)", "100X116 (16m)",
      "203X203 (10-13m)", "203X203 (16m)",
      "152X152 (10-13m) (PG)", "152X152 (16m) (PG)",
      "100X116 (10-13m) (PG)", "100X116 (16m) (PG)",
      "203X203 (10-13m) (PG)", "203X203 (16m) (PG)"
    ],
    "152x152x10/11/13" : [],
    "152x152x16": [],
    "203x203x10/11/13" : [],
    "203x203x16" : [],
    "100x116x10/11/13" : [],
    "100x116x16" : [],
    "15nb to 80nb" : [],
    "100nb to 150nb (non casing)" : [],
    "125nb & 150nb (casing)" : [],
    "168OD to 200nb (non casing)" : [],
    "168OD to 175nb (casing)" : [],
  }

  const items = Object.keys(materialOptions)
  const subItems = item ? materialOptions[item] : []

  const handleAdd = () => {
    if (!item) {
      alert("Fill required fields")
      return
    }
    onAdd({ item, subItem, weight, quantity })
    close()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
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

        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="material" className="font-medium">
              Material <span className="text-red-500">*</span>
            </label>
            <select
              id="material"
              className="w-full border rounded px-3 py-2 max-h-52 overflow-y-auto"
              value={item}
              onChange={(e) => {
                setItem(e.target.value)
                setSubItem("")
              }}
            >
              <option value="">Select Material</option>
              {items.map((mat) => (
                <option key={mat} value={mat}>{mat}</option>
              ))}
            </select>
          </div>

          {subItems.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="subItem" className="font-medium">Sub Material</label>
              <select
                id="subItem"
                className="w-full border rounded px-3 py-2 max-h-40 overflow-y-auto"
                value={subItem}
                onChange={(e) => setSubItem(e.target.value)}
              >
                <option value="">Select Sub Material</option>
                {subItems.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="weight" className="font-medium">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                placeholder="Enter weight"
                className="w-full border rounded px-3 py-2"
                value={weight}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (val >= 0 || e.target.value === "") {
                    setWeight(e.target.value)
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="font-medium">Quantity</label>
              <input
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                className="w-full border rounded px-3 py-2"
                value={quantity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (val >= 0 || e.target.value === "") {
                    setQuantity(e.target.value)
                  }
                }}
              />
            </div>
          </div>

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
