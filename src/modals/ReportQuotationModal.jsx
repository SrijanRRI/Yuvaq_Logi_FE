import { X, Award, Truck, Mail, Calendar } from "lucide-react"

const ReportQuotationModal = ({ quotations, onClose }) => {

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-4 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold">Quotation Details</h3>
                    <button onClick={onClose} className="text-white hover:text-teal-200 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-auto max-h-[calc(90vh-4rem)]">
                    <div className="p-6">
                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <h4 className="text-teal-800 font-medium mb-2 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-teal-600" />
                  Total Quotations
                </h4>
                <p className="text-3xl font-bold text-teal-700">{quotations.length}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-blue-800 font-medium mb-2 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  Selected Transporters
                </h4>
                <p className="text-3xl font-bold text-blue-700">{quotations.filter((q) => q.selected).length}</p>
              </div>
            </div> */}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Rank
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Transporter
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Vehicle
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Quoted Price
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Date & Time
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {quotations.map((quote, index) => (
                                        <tr key={index} className={quote.selected === "Yes" ? "bg-green-100" : ""}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-sm font-medium`}
                                                >
                                                    {quote.rank}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Truck className="h-4 w-4 mr-2 text-gray-500" />
                                                    <div className="text-sm font-medium text-gray-900">{quote.transporterName}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                                    <div className="text-sm text-gray-500">{quote.vendorEmail}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{quote.vehicleNumber}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{Number(quote.quotedPrice).toLocaleString("en-IN")}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                    {formatDateTime(quote.quotationDateTime)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {quote.selected === "Yes" ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full border border-green-400 bg-green-100 text-green-800">
                                                        Selected
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full border border-gray-400 bg-gray-100 text-gray-800">
                                                        Not Selected
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReportQuotationModal