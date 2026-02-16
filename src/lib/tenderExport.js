// Toggle name masking globally for exports
export const MASK_TRANSPORTER_NAMES_IN_EXPORT = true;

/* -------------------- tiny helpers -------------------- */
export const asId = (x) => (x && typeof x === "object" ? x._id : x);

export const htmlEscape = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDatePretty = (d) => (d ? formatDate(d) : "-");
const formatDateTimePretty = (d) => (d ? formatDateTime(d) : "-");

/** ✅ IMPORTANT: normalize any weird response shape into a plain array */
export const normalizeResponses = (raw) => {
  if (Array.isArray(raw)) return raw;

  // common API shapes
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.combinedForUI)) return raw.combinedForUI;
  if (Array.isArray(raw?.normal)) return raw.normal;
  if (Array.isArray(raw?.postBid)) return raw.postBid;

  // if backend returns { ok, data: { data: [] } } (rare)
  if (Array.isArray(raw?.data?.data)) return raw.data.data;

  return [];
};

export const getNameFromList = (idOrObj, transporterList = []) => {
  const id = asId(idOrObj);
  const found = transporterList.find((t) => t._id === id);
  return found?.name || found?.email || id;
};

export const getTransporterName = (transporter, transporterList = []) => {
  if (!transporter) return "Unknown";
  if (typeof transporter === "object") {
    return transporter.name || transporter.email || transporter._id || "Unknown";
  }
  const found = transporterList.find((t) => t._id === transporter);
  return found ? found.name || found.email : transporter;
};

// ✅ deterministic aliases: Transporter 1, Transporter 2...
export const buildAliasResolver = (sortedResponses = []) => {
  const map = new Map(); // key -> number
  let counter = 1;

  for (const r of sortedResponses) {
    const key = asId(r?.transportUser) || r?._id || String(counter);
    if (!map.has(key)) map.set(key, counter++);
  }

  return (r) => {
    const key = asId(r?.transportUser) || r?._id;
    const n = map.get(key);
    return `Transporter ${n ?? "—"}`;
  };
};

/* -------------------- ranks -------------------- */
/** ✅ Fix: arr.slice error by always converting to array */
export const ensureRanks = (raw = []) => {
  const arr = normalizeResponses(raw);

  const sorted = arr
    .slice()
    .sort((a, b) => (a?.price ?? Infinity) - (b?.price ?? Infinity));

  const labels = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9"];

  const keyOf = (r, i) => String(r?._id || r?.id || r?.quotationId || i);

  const byKey = new Map(sorted.map((r, i) => [keyOf(r, i), labels[i] || `L${i + 1}`]));

  return arr.map((r, i) => ({
    ...r,
    rank: r?.rank || byKey.get(keyOf(r, i)) || "-",
  }));
};

/* =========================================================
   ===============  PDF (print) HTML builder  ===============
   ========================================================= */
export const buildPrintableHTML = (tender, responses = [], transporterList = [], maskNames = true) => {
  const materials = tender?.materials || [];

  const rankOrder = ["L1", "L2", "L3", "L4", "L5", "L6"];
  const orderIndex = (r) => {
    const i = rankOrder.indexOf(r || "");
    return i === -1 ? 999 : i;
  };

  const arr = ensureRanks(responses);

  const sortedResponses = (arr || []).slice().sort((a, b) => {
    const ri = orderIndex(a.rank) - orderIndex(b.rank);
    if (ri !== 0) return ri;
    return (a.price ?? Infinity) - (b.price ?? Infinity);
  });

  const getAliasName = buildAliasResolver(sortedResponses);

  const isFinalized = tender?.status === "finalized";
  const selectedQuotationId = tender?.selectedQuotation?._id || null;

  const rows = sortedResponses.length
    ? sortedResponses.map((r) => {
        const name =
          maskNames && MASK_TRANSPORTER_NAMES_IN_EXPORT
            ? getAliasName(r)
            : r.name || getNameFromList(r.transportUser, transporterList) || "-";

        const isThisFinal =
          isFinalized &&
          (String(r._id) === String(selectedQuotationId) ||
            String(asId(r.transportUser)) === String(asId(tender?.selectedQuotation?.transportUser)) ||
            String(asId(r.transportUser)) === String(tender?.finalTransporter));

        const rawAmount =
          isThisFinal && tender?.finalPrice != null
            ? `₹${Number(tender.finalPrice).toLocaleString()}`
            : r?.price != null
            ? `₹${Number(r.price).toLocaleString()}`
            : "-";

        const vehicle = r?.vehicleNumber || "-";
        const quotedAt = r?.createdAt
          ? new Date(r.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "-";

        return {
          name,
          rank: r?.rank || "-",
          amount: rawAmount,
          vehicle,
          quotedAt,
          status: isThisFinal ? "FINALIZED ✅" : "—",
          isFinal: !!isThisFinal,
        };
      })
    : [];

  return `
  <!doctype html>
  <html>
  <head>
  <meta charset="utf-8" />
  <title>Tender Report - ${htmlEscape(tender?.projectName || tender?.projectCode || "Tender")}</title>
  <style>
    :root{
      --fs-body: 11px;
      --fs-small: 10px;
      --fs-head: 12px;
      --fs-title: 14px;
      --pad-s: 6px;
      --gap: 8px;
      --radius: 6px;
    }

    @page { size: A4; margin: 8mm; }

    @media print {
      html, body { width: 210mm; height: 297mm; }
      body { zoom: 0.92; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      table, tr, td, th, h3, .item, .totalBox { page-break-inside: avoid !important; }
    }

    body {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
      color: #0f172a;
      font-size: var(--fs-body);
      line-height: 1.35;
      margin: 0;
    }

    .header {
      display:flex; align-items:center; justify-content:space-between;
      border-bottom:1px solid #e2e8f0; padding-bottom: var(--pad-s); margin-bottom: var(--pad-s);
    }
    .brand { font-weight:800; font-size: 13px; color:#059669; letter-spacing:0.3px; }
    .title { font-size: var(--fs-title); font-weight:700; margin: 4px 0 2px; }
    .badge {
      font-size: var(--fs-small); border:1px solid #bae6fd; background:#e0f2fe; color:#0369a1;
      padding:2px 6px; border-radius:999px;
    }

    h3 { margin: 10px 0 6px; font-size: var(--fs-head); color:#334155; }

    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 6px var(--gap); }
    .item {
      background:#f8fafc; border:1px solid #e2e8f0; border-radius: var(--radius); padding: var(--pad-s);
    }
    .label { font-size: var(--fs-small); color:#64748b; margin-bottom:2px; }
    .value { font-weight:600; }

    table {
      width:100%; border-collapse:collapse; margin-top:6px; font-size: 10px; table-layout: fixed;
    }
    th { text-align:left; background:#f1f5f9; color:#334155; }
    th, td { border:1px solid #e2e8f0; padding: 6px; vertical-align:top; word-break: break-word; }

    .totals { display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:6px; }
    .totalBox {
      background:#ecfeff; border:1px solid #cffafe; border-radius: var(--radius); padding: var(--pad-s);
    }
    .tr-final { background:#ecfdf5; }
    .small { font-size: var(--fs-small); color:#64748b; }

    .footer {
      margin-top: 10px; border-top:1px dashed #cbd5e1; padding-top: 6px;
      font-size: var(--fs-small); color:#64748b; display:flex; justify-content:space-between;
    }
  </style>
  </head>
  <body>
    <div class="header">
      <div class="brand">LogiQ • Tender Report</div>
      <div class="badge">${htmlEscape(tender?.status || "Pending")}</div>
    </div>

    <div class="title">${htmlEscape(tender?.projectName || `Tender for ${tender?.dispatchLocation || "Location"}`)}</div>

    <h3>Project Details</h3>
    <div class="grid">
      <div class="item"><div class="label">Project Name</div><div class="value">${htmlEscape(tender?.projectName || "-")}</div></div>
      <div class="item"><div class="label">Project Code</div><div class="value">${htmlEscape(tender?.projectCode || "-")}</div></div>
      <div class="item" style="grid-column: span 2;"><div class="label">Purchase Order</div><div class="value">${htmlEscape(tender?.purchaseOrder || "-")}</div></div>
    </div>

    <h3>Windows & Dates</h3>
    <div class="grid">
      <div class="item"><div class="label">Delivery Window</div><div class="value">${
        tender?.deliveryWindow?.from && tender?.deliveryWindow?.to
          ? `${formatDatePretty(tender.deliveryWindow.from)} → ${formatDatePretty(tender.deliveryWindow.to)}`
          : "-"
      }</div></div>
      <div class="item"><div class="label">Bidding Window</div><div class="value">${
        tender?.biddingStart && tender?.biddingEnd
          ? `${formatDateTimePretty(tender.biddingStart)} → ${formatDateTimePretty(tender.biddingEnd)}`
          : "-"
      }</div></div>
      <div class="item"><div class="label">Closing Date</div><div class="value">${formatDatePretty(tender?.closeDate)}</div></div>
      <div class="item"><div class="label">Created</div><div class="value">${formatDatePretty(tender?.createdAt)}</div></div>
    </div>

    <h3>Location</h3>
    <div class="item"><div class="label">Dispatch Address</div><div class="value">${htmlEscape(
      [tender?.dispatchLocation, tender?.address, tender?.pincode].filter(Boolean).join(", ")
    )}</div></div>

    ${
      tender?.projectRemark
        ? `<h3>Project Remark</h3><div class="item"><div class="value">${htmlEscape(tender.projectRemark)}</div></div>`
        : ""
    }

    <h3>Materials</h3>
    ${
      (materials || []).length
        ? `<table>
            <thead><tr><th>Material</th><th>Sub Item</th><th>Weight (MT)</th><th>Quantity (pcs)</th></tr></thead>
            <tbody>
              ${materials
                .map(
                  (m) => `
                    <tr>
                      <td>${htmlEscape(m?.material || "-")}</td>
                      <td>${htmlEscape(m?.subMaterial || "-")}</td>
                      <td>${m?.weight ?? "-"}</td>
                      <td>${m?.quantity ?? "-"}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>`
        : `<div class="item"><div class="value">No materials added</div></div>`
    }

    <div class="totals">
      <div class="totalBox"><div class="label">Total Weight</div><div class="value">${tender?.totalWeight ?? "-"} MT</div></div>
      <div class="totalBox"><div class="label">Total Quantity</div><div class="value">${tender?.totalQuantity ?? "-"} pcs</div></div>
    </div>

    <div class="totals" style="margin-top:6px;">
      <div class="totalBox" style="grid-column: span 2;">
        <div class="label">Price Difference Rule</div>
        <div class="value">₹${tender?.priceDifference != null ? Number(tender.priceDifference).toLocaleString() : "-"} (minimum decrement to beat L1)</div>
        <div class="small">Example: If L1 is ₹300 and price difference is ₹20, next valid quote must be ₹280 or lower.</div>
      </div>
    </div>

    <h3>Transporter Responses</h3>
    ${
      rows.length
        ? `<table>
            <thead>
              <tr>
                <th>${maskNames && MASK_TRANSPORTER_NAMES_IN_EXPORT ? "Transporter" : "Name / Email"}</th>
                <th>Rank</th>
                <th>Amount (₹)</th>
                <th>Vehicle No</th>
                <th>Quoted At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r) => `
                    <tr class="${r.isFinal ? "tr-final" : ""}">
                      <td>${htmlEscape(r.name)}</td>
                      <td>${htmlEscape(r.rank)}</td>
                      <td>${htmlEscape(r.amount)}</td>
                      <td>${htmlEscape(r.vehicle)}</td>
                      <td>${htmlEscape(r.quotedAt)}</td>
                      <td>${htmlEscape(r.status)}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>`
        : `<div class="item"><div class="value">Transporters haven't submitted any quotations for this tender</div></div>`
    }

    ${tender?.remarks ? `<h3>Remarks</h3><div class="item"><div class="value">${htmlEscape(tender.remarks)}</div></div>` : ""}

    <div class="footer">
      <div>Generated: ${new Date().toLocaleString("en-GB")}</div>
      <div>Tender ID: ${htmlEscape(tender?._id || "-")}</div>
    </div>
  </body>
  </html>`;
};

/* =========================================================
   =====================  PDF Export  ======================
   ========================================================= */
export const exportTenderPDF = (tender, responsesRaw = [], transporterList = [], maskNames = true) => {
  const responses = ensureRanks(responsesRaw);
  const html = buildPrintableHTML(tender, responses, transporterList, maskNames);

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;

  iframe.onload = () => {
    try {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        setTimeout(() => {
          URL.revokeObjectURL(url);
          iframe.remove();
        }, 1000);
      }, 150);
    } catch (e) {
      URL.revokeObjectURL(url);
      iframe.remove();
    }
  };

  document.body.appendChild(iframe);
};

/* =========================================================
   =====================  CSV (Excel)  =====================
   ========================================================= */
export const exportTenderCSV = (tender, responsesRaw = [], transporterList = [], maskNames = true) => {
  const responses = ensureRanks(responsesRaw);

  const rows = [];
  const push = (a, b) => rows.push([a, b]);

  const csvEscape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const safeJoin = (arr) => (arr || []).filter(Boolean).join(", ");
  const asText = (v) => (v == null ? "" : `\u200C${String(v)}`);

  const isFinalized = tender?.status === "finalized";
  const selectedQuotationId = tender?.selectedQuotation?._id || null;

  const rankOrder = ["L1", "L2", "L3", "L4", "L5", "L6"];
  const orderIndex = (r) => {
    const i = rankOrder.indexOf(r || "");
    return i === -1 ? 999 : i;
  };

  const sortedResponses = (responses || []).slice().sort((a, b) => {
    const ri = orderIndex(a.rank) - orderIndex(b.rank);
    if (ri !== 0) return ri;
    return (a.price ?? Infinity) - (b.price ?? Infinity);
  });

  const getAliasName = buildAliasResolver(sortedResponses);

  rows.push(["==== TENDER SUMMARY ====", ""]);
  push("Project Name", tender?.projectName || "-");
  push("Project Code", tender?.projectCode || "-");
  push("Purchase Order", tender?.purchaseOrder || "-");
  if (tender?.projectRemark) push("Project Remark", tender.projectRemark);

  push(
    "Delivery Window",
    tender?.deliveryWindow?.from && tender?.deliveryWindow?.to
      ? `${formatDate(tender.deliveryWindow.from)} to ${formatDate(tender.deliveryWindow.to)}`
      : "-"
  );

  push(
    "Bidding Window",
    tender?.biddingStart && tender?.biddingEnd
      ? `${formatDateTime(tender.biddingStart)} to ${formatDateTime(tender.biddingEnd)}`
      : "-"
  );

  push("Closing Date", tender?.closeDate ? formatDate(tender.closeDate) : "-");
  push("Status", tender?.status || "Pending");
  push("Created", tender?.createdAt ? formatDate(tender.createdAt) : "-");
  push("Dispatch Address", safeJoin([tender?.dispatchLocation, tender?.address, tender?.pincode]));

  rows.push([]);
  rows.push(["==== TOTALS ====", ""]);
  push("Total Weight (MT)", tender?.totalWeight ?? "-");
  push("Total Quantity (pcs)", tender?.totalQuantity ?? "-");

  rows.push([]);
  rows.push(["==== BIDDING RULE ====", ""]);
  push(
    "Price Difference (₹) — min decrement to beat L1",
    tender?.priceDifference != null ? `₹${Number(tender.priceDifference).toLocaleString()}` : "-"
  );

  rows.push([]);
  rows.push(["==== MATERIALS ====", ""]);
  rows.push(["Material", "Sub Item", "Weight (MT)", "Quantity (pcs)"]);

  (tender?.materials || []).forEach((m) => {
    rows.push([m?.material || "-", m?.subMaterial || "-", asText(m?.weight ?? "-"), asText(m?.quantity ?? "-")]);
  });

  if (!tender?.materials || tender.materials.length === 0) {
    rows.push(["No materials added", ""]);
  }

  rows.push([]);
  rows.push(["==== TRANSPORTERS ====", ""]);
  rows.push(["Transporter", "Rank", "Amount (₹)", "Vehicle No", "Quoted At", "Status"]);

  if (sortedResponses.length > 0) {
    sortedResponses.forEach((r) => {
      const name =
        maskNames && MASK_TRANSPORTER_NAMES_IN_EXPORT
          ? getAliasName(r)
          : getTransporterName(r?.transportUser, transporterList) || "-";

      const isThisFinal =
        isFinalized &&
        (String(r?._id) === String(selectedQuotationId) ||
          String(asId(r?.transportUser)) === String(asId(tender?.selectedQuotation?.transportUser)) ||
          String(asId(r?.transportUser)) === String(tender?.finalTransporter));

      const statusLabel = isThisFinal ? "FINALIZED ✅" : "—";

      const rawAmount =
        isThisFinal && tender?.finalPrice != null
          ? `₹${Number(tender.finalPrice).toLocaleString()}`
          : `₹${Number(r?.price ?? 0).toLocaleString()}`;

      const amount = asText(rawAmount);
      const vehicle = r?.vehicleNumber || "-";

      const quotedAt = r?.createdAt
        ? new Date(r.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "-";

      rows.push([name, r?.rank || "-", amount, vehicle, quotedAt, statusLabel]);
    });
  } else {
    rows.push(["Transporters haven't submitted any quotations for this tender", "", "", "", "", ""]);
  }

  if (tender?.remarks) {
    rows.push([]);
    rows.push(["==== REMARKS ====", ""]);
    rows.push([tender.remarks, ""]);
  }

  // UTF-8 BOM so Excel renders ₹ properly
  const csv =
    "\ufeff" + rows.map((r) => (Array.isArray(r) ? r.map(csvEscape).join(",") : csvEscape(String(r)))).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const fileBase = (tender?.projectCode || tender?.projectName || "tender").replace(/\s+/g, "_");
  a.href = url;
  a.download = `${fileBase}_report.csv`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ✅ Less confusing name (what you asked)
export const exportTenderExcel = exportTenderCSV;