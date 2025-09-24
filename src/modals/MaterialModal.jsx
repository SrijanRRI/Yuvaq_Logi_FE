import { useState } from "react"
import { X, Plus, Package, Info } from "lucide-react"

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
    Portal: [],
    TTC: [],
    MAST: [],
    SPS: [],
    "Octagonal Poles": [],
    "Conical Poles": [],
    "HR Coil": [],
    "Conical Poles PU Paint": [],
    HM: [],
    SM: [],
    Galvalume: [],
    "Tower Structure": [],
    "Solar Structure": [],
    HDG: [],
    "MS Pipe": [
      "15nb to 80nb",
      "100nb to 150nb (non casing)",
      "125nb & 150nb casing",
      "168OD to 200nb (non casing)",
      "168OD to 175nb casing",
    ],
    "GI Pipe": [
      "15nb to 80nb",
      "100nb to 150nb (non casing)",
      "125nb & 150nb casing",
      "168OD to 200nb (non casing)",
      "168OD to 175nb casing",
    ],
    Angle: [
      "70",
      "80",
      "90",
      "100",
      "110",
      "120",
      "130(8,15,16mm)",
      "130(10,12,14mm)",
      "150(10,12,14,15,16,20mm)",
      "150(18mm)",
      "200(12,14,15,16,18,20,22,24mm)",
      "200 (25mm)",
      "130(8,15,16mm) (PG)",
      "130(10,12,14mm) (PG)",
      "150(10,12,14,15,16,20mm) (PG)",
      "150(18mm) (PG)",
      "200(12,14,15,16,18,20,22,24mm) (PG)",
      "200 (25mm) (PG)",
      "70 (PG)",
      "80 (PG)",
      "90 (PG)",
      "100 (PG)",
      "110 (PG)",
      "120 (PG)",
    ],
    Channel: ["150X75", "175X75", "200X75", "150X75 (PG)", "175X75 (PG)", "200X75 (PG)"],
    "MS Beam": [
      "152X152 (10m)",
      "152X152 (11m)",
      "152X152 (13m)",
      "152X152 (16m)",
      "100X116 (10m)",
      "100X116 (11m)",
      "100X116 (13m)",
      "100X116 (16m)",
      "203X203 (10m)",
      "203X203 (11m)",
      "203X203 (13m)",
      "203X203 (16m)",
      "152X152 (10m) (PG)",
      "152X152 (11m) (PG)",
      "152X152 (13m) (PG)",
      "152X152 (16m) (PG)",
      "100X116 (10m) (PG)",
      "100X116 (11m) (PG)",
      "100X116 (13m) (PG)",
      "100X116 (16m) (PG)",
      "203X203 (10m) (PG)",
      "203X203 (11m) (PG)",
      "203X203 (13m) (PG)",
      "203X203 (16m) (PG)",
    ],
    "GI Beam": [
      "152X152 (10m)",
      "152X152 (11m)",
      "152X152 (13m)",
      "152X152 (16m)",
      "100X116 (10m)",
      "100X116 (11m)",
      "100X116 (13m)",
      "100X116 (16m)",
      "203X203 (10m)",
      "203X203 (11m)",
      "203X203 (13m)",
      "203X203 (16m)",
      "152X152 (10m) (PG)",
      "152X152 (11m) (PG)",
      "152X152 (13m) (PG)",
      "152X152 (16m) (PG)",
      "100X116 (10m) (PG)",
      "100X116 (11m) (PG)",
      "100X116 (13m) (PG)",
      "100X116 (16m) (PG)",
      "203X203 (10m) (PG)",
      "203X203 (11m) (PG)",
      "203X203 (13m) (PG)",
      "203X203 (16m) (PG)",
    ],
    "152x152x10/11/13": [],
    "152x152x16": [],
    "203x203x10/11/13": [],
    "203x203x16": [],
    "100x116x10/11/13": [],
    "100x116x16": [],
    "15nb to 80nb": [],
    "100nb to 150nb (non casing)": [],
    "125nb & 150nb (casing)": [],
    "168OD to 200nb (non casing)": [],
    "168OD to 175nb (casing)": [],
    "LT Panel": [],
    "PLC Panel" : [],
    "VFD Panel" : [],
    "PCC Panel" : [],
    "AMF Panel" : [],
    "MCC Panel" : [],
    "APFC Panel" : [],
    "METER Panel" : [],
    "CUBICAL Panel" : [],
    "STARTER Panel" : [],
    "CONTROL DESK" : [],
    "HIGH MAST Panel" : [],
    "FEEDER Pillar Panel": [],
    "STADIUM MAST Panel" : [],
    "SYNCHRONISING Panel" : [],
    "JUNCTION BOXES" : [],
    "TRANSFORMER Distribution Board" : [],
    "CONTROL and RELAY Panel UPTO 132 KV" : [],
  }

  const items = Object.keys(materialOptions)
  const subItems = item ? materialOptions[item] : []

  const handleAdd = () => {
    if (!item) {
      alert("Fill required fields")
      return
    }

    if (subItems.length > 0 && !subItem) {
      alert("Please select a sub material.")
      return
    }

    onAdd({ item, subItem, weight, quantity })

    close()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl p-0 relative max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Add Material
            </h2>
            <button
              onClick={close}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="material" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                Material <span className="text-red-500">*</span>
              </label>
              <select
                id="material"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                value={item}
                onChange={(e) => {
                  setItem(e.target.value)
                  setSubItem("")
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

            {subItems.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="subItem" className=" text-sm font-medium text-slate-700 flex items-center gap-1">
                  Sub Material <span className="text-red-500">*</span>
                </label>
                <select
                  id="subItem"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  value={subItem}
                  onChange={(e) => setSubItem(e.target.value)}
                >
                  <option value="">Select Sub Material</option>
                  {subItems.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="weight" className=" text-sm font-medium text-slate-700 flex items-center gap-1">
                  Weight (MT)
                </label>
                <input
                  type="number"
                  id="weight"
                  placeholder="Enter weight"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  value={weight}
                  onChange={(e) => {
                    const val = Number.parseFloat(e.target.value)
                    if (val >= 0 || e.target.value === "") {
                      setWeight(e.target.value)
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="quantity" className=" text-sm font-medium text-slate-700 flex items-center gap-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  placeholder="Enter quantity"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  value={quantity}
                  onChange={(e) => {
                    const val = Number.parseFloat(e.target.value)
                    if (val >= 0 || e.target.value === "") {
                      setQuantity(e.target.value)
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2 text-sm text-blue-700">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Please ensure all measurements are accurate. Weight should be in metric tons (MT) and quantity in
                pieces.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors duration-200 flex items-center gap-2"
                onClick={close}
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
                onClick={handleAdd}
              >
                <Plus className="h-4 w-4" /> Add Material
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
