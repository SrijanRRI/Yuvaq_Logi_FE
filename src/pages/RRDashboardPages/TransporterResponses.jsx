import TransporterResponseItem from "./TransporterResponseItem";
import { Truck } from "lucide-react";

const TransporterResponses = ({
    responses,
    tender,
    selectedQuotationId,
    confirmedIdxMap,
    reopenedTenders,
    editingId,
    priceInput,
    setEditingId,
    setPriceInput,
    onConfirmFinal,
    onReopen,
    getTransporterName,
    setPreviewFile,
    responseError,
}) => {
    return (
        <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" /> Transporter Responses
            </h4>

            {responseError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 text-sm mb-4">
                    {responseError}
                </div>
            ) : responses.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                    <Truck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No responses received yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {responses.map((res, idx) => (
                        <TransporterResponseItem
                            key={res._id || idx}
                            response={res}
                            idx={idx}
                            tender={tender}
                            selectedQuotationId={selectedQuotationId}
                            confirmedIdxMap={confirmedIdxMap}
                            reopenedTenders={reopenedTenders}
                            editingId={editingId}
                            priceInput={priceInput}
                            setEditingId={setEditingId}
                            setPriceInput={setPriceInput}
                            onConfirmFinal={onConfirmFinal}
                            onReopen={onReopen}
                            getTransporterName={getTransporterName}
                            setPreviewFile={setPreviewFile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransporterResponses;