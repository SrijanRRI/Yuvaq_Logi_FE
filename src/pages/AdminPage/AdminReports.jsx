import { useEffect, useRef, useState } from "react"
import * as XLSX from "xlsx"
import ReportQuotationModal from "../../modals/ReportQuotationModal"
import { FileText, Download, Search, Eye, ClipboardList } from "lucide-react"

const AdminReports = ({ data }) => {
  const safeData = Array.isArray(data) ? data : []
  const [selectedQuotations, setSelectedQuotations] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

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

  // ====== PDF HELPERS ======
  // ====== PDF HELPERS ======
  const htmlEscape = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  const formatINR = (v) => {
    if (v === null || v === undefined || v === "" || v === "-") return "-"
    const n = Number(v)
    if (Number.isNaN(n)) return String(v)
    return `₹${n.toLocaleString("en-IN")}`
  }

  // Soft badge colors by status
  const statusColors = (status = "") => {
    const s = String(status).toLowerCase()
    if (s === "finalized") return { bg: "#ecfdf5", bd: "#a7f3d0", fg: "#065f46" } // green
    if (s === "open") return { bg: "#fffbeb", bd: "#fde68a", fg: "#92400e" }      // amber
    if (s === "closed") return { bg: "#fef2f2", bd: "#fecaca", fg: "#991b1b" }    // red
    return { bg: "#eff6ff", bd: "#bfdbfe", fg: "#1e40af" }                        // blue / default
  }

  /**
   * Build compact, printable HTML for the Admin Reports table data.
   * @param {Array} rows - your filteredData array (items with tenderInfo + quotations)
   * NOTE: Uses formatDate and formatDateTime already defined in this component.
   */
  const buildAdminPrintableHTML = (rows = []) => {
    const total = rows.length

    const cardsHTML = rows.map((item, idx) => {
      const info = item?.tenderInfo || {}
      const status = info.status || "-"
      const { bg, bd, fg } = statusColors(status)

      const deliveryFrom = htmlEscape(
        (typeof formatDate === "function" ? formatDate(info.deliveryWindow?.from) : info.deliveryWindow?.from) || "-"
      )
      const deliveryTo = htmlEscape(
        (typeof formatDate === "function" ? formatDate(info.deliveryWindow?.to) : info.deliveryWindow?.to) || "-"
      )
      const closeDate = htmlEscape(
        (typeof formatDate === "function" ? formatDate(info.closeDate) : info.closeDate) || "-"
      )
      const bidStart = htmlEscape(
        (typeof formatDateTime === "function" ? formatDateTime(info.biddingStart) : info.biddingStart) || "-"
      )
      const bidEnd = htmlEscape(
        (typeof formatDateTime === "function" ? formatDateTime(info.biddingEnd) : info.biddingEnd) || "-"
      )
      const maxBid = htmlEscape(formatINR(info.maxBidAmount))
      const remarks = htmlEscape(info.remarks || "-")
      const projectRemark = info.projectRemark ? htmlEscape(info.projectRemark) : ""

      // Quotations table or a friendly “no quotes” line
      const quotes = Array.isArray(item.quotations) ? item.quotations : []
      const quotesBlock = quotes.length
        ? `
        <table class="qt">
          <thead>
            <tr>
              <th>Transporter</th>
              <th>Vendor Email</th>
              <th>Vehicle Details</th>
              <th>Quoted Price</th>
              <th>Rank</th>
              <th>Selected</th>
              <th>Quotation DateTime</th>
            </tr>
          </thead>
          <tbody>
            ${quotes.map((q) => {
          const sel = (q.selected === true || String(q.selected).toLowerCase() === "yes")
            ? "Yes ✅"
            : "—"
          const qdt = htmlEscape(
            (typeof formatDateTime === "function" ? formatDateTime(q.quotationDateTime) : q.quotationDateTime) || "-"
          )
          return `
                <tr>
                  <td>${htmlEscape(q.transporterName || "-")}</td>
                  <td>${htmlEscape(q.vendorEmail || "-")}</td>
                  <td>${htmlEscape(q.vehicleNumber || "-")}</td>
                  <td>${htmlEscape(formatINR(q.quotedPrice))}</td>
                  <td>${htmlEscape(q.rank || "-")}</td>
                  <td>${sel}</td>
                  <td>${qdt}</td>
                </tr>
              `
        }).join("")}
          </tbody>
        </table>
      `
        : `<div class="noq">Transporters haven't submitted any quotations for this tender.</div>`

      return `
      <div class="card">
        <div class="card-hd">
          <div class="title">${htmlEscape(info.projectName || "-")}</div>
          <div class="badge" style="background:${bg};border-color:${bd};color:${fg};">${htmlEscape(status)}</div>
        </div>

        <div class="grid">
          <div class="item">
            <div class="label">Product</div>
            <div class="value">${htmlEscape(info.product || "-")}</div>
          </div>
          <div class="item">
            <div class="label">Project Code</div>
            <div class="value">${htmlEscape(info.projectCode || "-")}</div>
          </div>
          <div class="item">
            <div class="label">Purchase Order</div>
            <div class="value">${htmlEscape(info.purchaseOrder || "-")}</div>
          </div>

          <div class="item">
            <div class="label">Dispatch Location</div>
            <div class="value">${htmlEscape(info.dispatchLocation || "-")}</div>
          </div>
          <div class="item">
            <div class="label">Delivery Window</div>
            <div class="value">${deliveryFrom} → ${deliveryTo}</div>
          </div>
          <div class="item">
            <div class="label">Close Date</div>
            <div class="value">${closeDate}</div>
          </div>

          <div class="item">
            <div class="label">Bidding Start</div>
            <div class="value">${bidStart}</div>
          </div>
          <div class="item">
            <div class="label">Bidding End</div>
            <div class="value">${bidEnd}</div>
          </div>
          <div class="item">
            <div class="label">Remarks</div>
            <div class="value">${remarks}</div>
          </div>

          <div class="item">
            <div class="label">Total Weight (MT)</div>
            <div class="value">${htmlEscape(String(info.totalWeight ?? "-"))}</div>
          </div>
          <div class="item">
            <div class="label">Total Quantity (pcs)</div>
            <div class="value">${htmlEscape(String(info.totalQuantity ?? "-"))}</div>
          </div>
          <div class="item">
            <div class="label">Max Bid Amount</div>
            <div class="value">${maxBid}</div>
          </div>
        </div>

        ${projectRemark ? `<div class="remark"><span class="label">Project Remark:</span> <span class="value">${projectRemark}</span></div>` : ""}

        <div class="quotes">
          <div class="label">Quotations</div>
          ${quotesBlock}
        </div>
      </div>
    `
    }).join("")

    return `
    <!doctype html>
    <html>
    <head>
    <meta charset="utf-8" />
    <title>Tender Summary Report</title>
    <style>
      /* compact, one-page-ish */
      :root {
        --fs-body: 11px; --fs-small: 10px; --fs-head: 12px;
        --pad-xxs: 4px; --pad-s: 6px; --pad: 8px; --gap: 8px;
        --radius: 8px;
      }
      @page { size: A4; margin: 10mm; }
      @media print {
        html, body { width: 210mm; height: 297mm; }
        body { zoom: 0.92; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .card, table, tr, td, th, h3 { page-break-inside: avoid !important; }
        .card { page-break-after: auto; }
      }
      * { box-sizing: border-box; }
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        color:#0f172a; font-size:var(--fs-body); line-height:1.35; margin:0; background:#ffffff;
      }
      .header {
        display:flex; align-items:center; justify-content:space-between;
        padding: 10px 12px;
        background: linear-gradient(90deg, #0f766e, #115e59);
        color:#ecfeff;
      }
      .brand { font-weight:800; font-size: 16px; letter-spacing:.2px; }
      .sub { font-size: var(--fs-small); opacity:.95; }
      .wrap { padding: 10px; }
      .card {
        border:1px solid #e2e8f0; border-radius: var(--radius);
        margin-bottom: var(--gap); background:#fff; overflow:hidden;
        box-shadow: 0 1px 1px rgba(2,6,23,.04), 0 1px 2px rgba(2,6,23,.06);
      }
      .card-hd {
        display:flex; justify-content:space-between; align-items:center;
        padding: 8px 10px; background:#f8fafc; border-bottom:1px solid #e2e8f0;
      }
      .title { font-weight:700; font-size: var(--fs-head); color:#0f172a; }
      .badge {
        font-size: 10px; border:1px solid; padding:2px 8px; border-radius:999px; font-weight:600;
      }
      .grid {
        display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px;
      }
      .item {
        background:#ffffff; border:1px solid #e2e8f0; border-radius: 6px; padding: 8px;
      }
      .label { font-size: 10px; color:#64748b; margin-bottom:3px; }
      .value { font-weight:600; color:#0f172a; word-break: break-word; }
      .remark { padding: 0 10px 8px 10px; }
      .quotes { padding: 0 10px 12px 10px; }
      .qt { width:100%; border-collapse:collapse; font-size: 10px; table-layout: fixed; }
      .qt th { text-align:left; background:#eef2f7; color:#334155; }
      .qt th, .qt td { border:1px solid #e2e8f0; padding: 6px; vertical-align:top; word-break: break-word; }
      .qt tbody tr:nth-child(even) td { background:#fafbfc; }
      .noq {
        padding: 8px; font-style: italic; color:#475569; background:#f8fafc; border:1px dashed #e2e8f0; border-radius:6px;
      }
      .footer {
        margin: 8px 10px 12px; border-top:1px dashed #cbd5e1; padding-top: 8px;
        display:flex; justify-content:space-between; font-size: var(--fs-small); color:#475569;
      }
    </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Tender Summary Report</div>
          <div class="sub">Generated ${new Date().toLocaleString("en-GB")}</div>
        </div>
        <div class="sub">Total tenders: ${total}</div>
      </div>

      <div class="wrap">
        ${cardsHTML}
      </div>

      <div class="footer">
        <div>Generated: ${new Date().toLocaleString("en-GB")}</div>
        <div>Tenders: ${total}</div>
      </div>
    </body>
    </html>
  `
  }

  /**
   * Download/print PDF for current filtered rows (no popup; uses hidden iframe + print dialog).
   * @param {Array} filteredRows - pass your filteredData here
   */
  const downloadPDF = (filteredRows) => {
    const html = buildAdminPrintableHTML(filteredRows)
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    // Hidden iframe (no new tab), triggers browser print dialog (user selects "Save as PDF")
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    iframe.src = url

    iframe.onload = () => {
      try {
        setTimeout(() => {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
          setTimeout(() => {
            URL.revokeObjectURL(url)
            iframe.remove()
          }, 800)
        }, 150)
      } catch {
        URL.revokeObjectURL(url)
        iframe.remove()
      }
    }

    document.body.appendChild(iframe)
  }



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

          {/* Download dropdown */}
          <div
            className="relative flex-shrink-0"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg shadow-md hover:shadow-lg transition-colors"
              title="Download report"
            >
              <Download className="h-5 w-5" />
              Download
              <span className="ml-1 text-white/90 text-sm">▼</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => {
                    setMenuOpen(false)
                    downloadPDF(filteredData)
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => {
                    setMenuOpen(false)
                    downloadExcel()
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download Excel
                </button>
              </div>
            )}
          </div>
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
                          ${info.status === "finalized"
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
