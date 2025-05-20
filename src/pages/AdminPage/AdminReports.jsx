import { useState } from "react"
import * as XLSX from "xlsx"
import ReportQuotationModal from "../../modals/ReportQuotationModal"
import { FileText, Download, Search, Calendar, Clock, Eye, ClipboardList } from "lucide-react"

const AdminReports = ({ data }) => {
  const safeData = Array.isArray(data) ? data : []
  const [selectedQuotations, setSelectedQuotations] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const downloadExcel = () => {
    const exportData = []

    safeData.forEach((item) => {
      const info = item.tenderInfo || {}
      const base = {
        ProjectName: info.projectName,
        ProjectCode: info.projectCode,
        PurchaseOrder: info.purchaseOrder,
        ProjectRemark: info.projectRemark,
        Product: info.product,
        DispatchLocation: info.dispatchLocation,
        DeliveryFrom: formatDate(info.deliveryWindow?.from),
        DeliveryTo: formatDate(info.deliveryWindow?.to),
        CloseDate: formatDateTime(info.closeDate),
        BiddingStart: formatDateTime(info.biddingStart),
        BiddingEnd: formatDateTime(info.biddingEnd),
        Remarks: info.remarks,
        TotalWeight: info.totalWeight,
        TotalQuantity: info.totalQuantity,
        MaxBidAmount: info.maxBidAmount,
        ReopenCount: info.reopenCount,
        Status: info.status,
      }

      if (Array.isArray(item.quotations) && item.quotations.length > 0) {
        item.quotations.forEach((q) => {
          exportData.push({
            ...base,
            Transporter: q.transporterName,
            VendorEmail: q.vendorEmail,
            VehicleDetails: q.vehicleNumber,
            QuotedPrice: q.quotedPrice,
            Rank: q.rank,
            Selected: q.selected,
            QuotationDateTime: formatDateTime(q.quotationDateTime),
          })
        })
      } else {
        exportData.push({
          ...base,
          Transporter: "No Quotations",
          VendorEmail: "-",
          VehicleDetails: "-",
          QuotedPrice: "-",
          Rank: "-",
          Selected: "-",
          QuotationDateTime: "-",
        })
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tender with Quotations")
    XLSX.writeFile(workbook, "Tender_Quotations_Report.xlsx")
  }

  // Filter data based on search term and status filter
  const filteredData = safeData.filter((item) => {
    const info = item.tenderInfo || {}
    const matchesSearch =
      info.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.projectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.purchaseOrder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.product?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || info.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Get unique statuses for filter
  const statuses = ["all", ...new Set(safeData.map((item) => item.tenderInfo?.status).filter(Boolean))]

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FileText className="h-7 w-7 mr-2" />
              Tender Summary Report
            </h2>
            <p className="text-teal-100 mt-1 flex items-center">
              <ClipboardList className="h-4 w-4 mr-1" />
              {safeData.length} tender{safeData.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 flex items-center font-semibold text-lg shadow-md hover:shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Search by Project Name, Project Code, Purchase Order, Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="overflow-auto rounded-lg shadow-md border border-gray-200">
          {filteredData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Project Name with remarks
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Project Code
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Purchase Order
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Dispatch Location
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Delivery Window
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Close Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Bidding Window
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Remarks
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Total Weight (MT)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Total Quantity (Pcs)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Max Bid Amount
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Reopen Count
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Quotations
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-300"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, i) => {
                  const info = item.tenderInfo || {}
                  return (
                    <tr
                      key={i}
                      className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-200`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">
                        <div className="font-medium">{info.product}</div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{info.projectName}</div>
                        <div className="text-xs text-gray-500">({info.projectRemark})</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">{info.projectCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">{info.purchaseOrder}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">
                        {info.dispatchLocation}
                      </td>
                      <td className="px-4 py-3 text-sm border-r border-gray-100">
                        <div className="flex flex-col bg-amber-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <span className="font-medium text-amber-700">From:</span>
                          </div>
                          <span className="text-gray-700 ">{formatDate(info.deliveryWindow?.from)}</span>

                          <div className="flex items-center mt-2">
                            <span className="font-medium text-amber-700">To:</span>
                          </div>
                          <span className="text-gray-700 ">{formatDate(info.deliveryWindow?.to)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">
                        <div className="bg-purple-50 p-2 rounded-md">
                          <div className="flex items-center">
                            {/* <Clock className="h-4 w-4 text-purple-500 mr-1" /> */}
                            <span className="font-medium text-purple-700">Close:</span>
                          </div>
                          <span className="text-gray-700 ">{formatDate(info.closeDate)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm border-r border-gray-100">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-md shadow-sm">
                          <div className="flex items-center mb-1">
                            {/* <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div> */}
                            <span className="font-medium text-blue-800">Start:</span>
                          </div>
                          <div className=" mb-3 text-gray-700 flex items-center">
                            {formatDateTime(info.biddingStart)}
                          </div>

                          <div className="border-t border-blue-100 pt-2 mt-1"></div>

                          <div className="flex items-center mb-1 mt-2">
                            {/* <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div> */}
                            <span className="font-medium text-blue-800">End:</span>
                          </div>
                          <div className=" text-gray-700 flex items-center">
                            {formatDateTime(info.biddingEnd)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100 capitalize">
                        {info.remarks || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded-md">{info.totalWeight}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded-md">{info.totalQuantity}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded-md">{Number(info.maxBidAmount).toLocaleString("en-IN") || " - "}</span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-full capitalize
                          ${
                            info.status === "finalized"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : info.status === "open"
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : info.status === "closed"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {info.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">
                        <div className="flex justify-center">
                          <span className="font-medium bg-gray-100 px-2.5 py-1 rounded-full text-center min-w-[24px]">
                            {info.reopenCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">
                        <div className="flex justify-center">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full min-w-[24px] text-center">
                            {item.quotations?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {item.quotations?.length > 0 ? (
                          <button
                            onClick={() => setSelectedQuotations(item.quotations)}
                            className="text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center shadow-sm hover:shadow"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                            No Quotations
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 bg-gray-50">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tenders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No tender data is available."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quotation Modal */}
      {selectedQuotations && (
        <ReportQuotationModal quotations={selectedQuotations} onClose={() => setSelectedQuotations(null)} />
      )}
    </div>
  )
}

export default AdminReports
