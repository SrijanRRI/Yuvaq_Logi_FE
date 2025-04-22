import { FileText, Download, X } from "lucide-react";

const AttachmentPreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-red-500 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-semibold mb-4 pr-8">{file.originalName}</h3>

        {file.mimetype?.startsWith("image/") ? (
          <img
            src={file.url || "/placeholder.svg"}
            alt={file.originalName}
            className="w-full max-h-[70vh] object-contain rounded-md"
          />
        ) : file.mimetype === "application/pdf" ? (
          <iframe
            src={file.url}
            className="w-full h-[70vh] rounded-md"
            title="PDF Preview"
          />
        ) : (
          <div className="bg-slate-50 p-8 rounded-md text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Preview not supported for this file type.</p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <a
            href={file.url}
            download={file.originalName}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default AttachmentPreviewModal;