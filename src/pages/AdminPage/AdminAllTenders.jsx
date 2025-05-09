import React, { useState } from "react";
import { FileText, Package, MapPin, Calendar, Clock, Truck, DollarSign, CheckCircle, AlertCircle, ChevronDown, ChevronUp, User, Clipboard, Tag, FileCheck } from 'lucide-react';

const groupQuotationsByUser = (quotations = []) => {
  const grouped = {};
  quotations.forEach((q) => {
    const userId = q.transportUser?._id || "unknown";
    if (!grouped[userId]) {
      grouped[userId] = {
        user: q.transportUser,
        quotes: [],
      };
    }
    grouped[userId].quotes.push(q);
  });
  return grouped;
};

const AdminAllTenders = ({ tenders = [] }) => {
  const [expandedTenders, setExpandedTenders] = useState({});
  const [openQuoteDropdowns, setOpenQuoteDropdowns] = useState({});

  const toggleExpand = (id) => {
    setExpandedTenders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleQuoteDropdown = (userId) => {
    setOpenQuoteDropdowns((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-white h-5 w-5" />
          <h2 className="text-xl font-bold text-white">All Tenders</h2>
        </div>
        <div className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
          {tenders.length} {tenders.length === 1 ? 'Tender' : 'Tenders'}
        </div>
      </div>

      <div className="p-6">
        {tenders.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-teal-500" />
            </div>
            <p className="text-gray-500 text-lg">No tenders found</p>
            <p className="text-gray-400 text-sm mt-2">Tenders will appear here once they are created</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tenders.map((tender, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Tender Header */}
                <div
                  className="p-5 cursor-pointer flex justify-between items-start border-b border-gray-100"
                  onClick={() => toggleExpand(idx)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clipboard className="h-4 w-4 text-teal-600" />
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {tender.projectName || `Tender #${idx + 1}`}
                      </h3>

                      {tender.selectedQuotation && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          Finalized
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Created By : {tender.createdBy?.name || "Unknown"}</span>
                      </div>

                      {tender.projectCode && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>Project Code: {tender.projectCode}</span>
                        </div>
                      )}

                      {tender.purchaseOrder && (
                        <div className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          <span> Purchase Order: {tender.purchaseOrder}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm">
                      <Package className="h-3 w-3" />
                      <span>Weight : {tender.totalWeight || 0} MT </span>
                    </div>

                    <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm">
                      <Package className="h-3 w-3" />
                      <span>Quantity : {tender.totalQuantity || 0} pcs </span>
                    </div>


                    {expandedTenders[idx] ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Tender Details (Expandable) */}
                {expandedTenders[idx] && (
                  <div className="p-5 bg-gray-50 border-b border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-teal-700 font-medium mb-2">
                          <MapPin className="h-4 w-4" />
                          <h4>Location Details</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Dispatch:</span> {tender.dispatchLocation || "N/A"}</p>
                          <p><span className="text-gray-500">Address:</span> {tender.address || "N/A"}</p>
                          <p><span className="text-gray-500">Pincode:</span> {tender.pincode || "N/A"}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-teal-700 font-medium mb-2">
                          <Calendar className="h-4 w-4" />
                          <h4>Timeline</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-500">Delivery Window:</span>{" "}
                            {tender.deliveryWindow?.from && tender.deliveryWindow?.to
                              ? `${new Intl.DateTimeFormat("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              }).format(new Date(tender.deliveryWindow.from))} to ${new Intl.DateTimeFormat("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              }).format(new Date(tender.deliveryWindow.to))}`
                              : "N/A"}
                          </p>
                          <p>
                            <span className="text-gray-500">Close Date:</span>{" "}
                            {tender.closeDate
                              ? new Intl.DateTimeFormat("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }).format(new Date(tender.closeDate))
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-teal-700 font-medium mb-2">
                          <Package className="h-4 w-4" />
                          <h4>Shipment Details</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Total Weight:</span> {tender.totalWeight || 0} MT</p>
                          <p><span className="text-gray-500">Total Quantity:</span> {tender.totalQuantity || 0} pcs</p>
                          <p><span className="text-gray-500">Remarks:</span> {tender.remarks || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Materials Section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-teal-700 font-medium mb-3">
                        <Package className="h-4 w-4" />
                        <h4>Materials</h4>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 text-xs font-medium text-gray-600 border-b border-gray-200">
                          <div>Material</div>
                          <div>Sub Material</div>
                          <div>Weight</div>
                          <div>Quantity</div>
                        </div>

                        {tender.materials && tender.materials.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {tender.materials.map((mat, mIdx) => (
                              <div key={mIdx} className="grid grid-cols-4 gap-4 p-3 text-sm">
                                <div>{mat.material || "N/A"}</div>
                                <div>{mat.subMaterial || "N/A"}</div>
                                <div>{mat.weight || 0} MT</div>
                                <div>{mat.quantity || 0} pcs</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No materials listed
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quotations Section */}
                    <div>
                      <div className="flex items-center gap-2 text-teal-700 font-medium mb-3">
                        <DollarSign className="h-4 w-4" />
                        <h4>Quotations</h4>
                      </div>

                      {tender.quotations && tender.quotations.length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(groupQuotationsByUser(tender.quotations)).map(([userId, { user, quotes }]) => {
                            const isOpen = openQuoteDropdowns[userId];
                            const isSelectedAny = quotes.some(q => q._id === tender.selectedQuotation?._id);

                            return (
                              <div
                                key={userId}
                                className={`rounded-lg border ${isSelectedAny ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}
                              >
                                <div
                                  className="flex justify-between items-center p-4 cursor-pointer"
                                  onClick={() => toggleQuoteDropdown(userId)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium">{user?.name || "Unknown Transporter"}</span>
                                    {isSelectedAny && (
                                      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Selected</span>
                                    )}
                                  </div>
                                  {isOpen ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>

                                {isOpen && (
                                  <div className="space-y-3 px-4 pb-4">
                                    {quotes
                                      .slice()
                                      .sort((a, b) => a.price - b.price)
                                      .map((quote, qIdx) => {
                                        const isSelected = quote._id === tender.selectedQuotation?._id;
                                        return (
                                          <div
                                            key={qIdx}
                                            className={`p-3 rounded-lg border ${isSelected ? "border-green-200 bg-green-100" : "border-gray-200 bg-white"}`}
                                          >
                                            <div className="flex flex-wrap justify-between items-start gap-4">
                                              <div>
                                                <p className="text-sm text-gray-500">
                                                  {quote.transportUser?.email || "No email"}
                                                </p>
                                              </div>

                                              <div className="flex flex-wrap gap-4 text-sm">
                                                <div
                                                  className={`px-3 py-1 rounded-full ${isSelected
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                  ₹{quote.price || 0}
                                                </div>

                                                <div className="flex items-center gap-1 text-gray-600">
                                                  <Clock className="h-3 w-3" />
                                                  <span>{new Date(quote.createdAt).toLocaleString()}</span>
                                                </div>

                                                {quote.vehicleNumber && (
                                                  <div className="flex items-center gap-1 text-gray-600">
                                                    <Truck className="h-3 w-3" />
                                                    <span>{quote.vehicleNumber}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {isSelected && tender.finalPrice !== undefined && tender.finalPrice !== null && (
                                              <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-green-700">
                                                  <CheckCircle className="h-4 w-4" />
                                                  <span className="font-medium">Finalized Quotation</span>
                                                </div>
                                                <div className="font-bold text-green-700">
                                                  At Price: ₹{quote.price}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No quotations submitted yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAllTenders;