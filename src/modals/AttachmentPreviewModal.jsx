"use client"
import { FileText, Download, X, ExternalLink, ImageIcon, File } from "lucide-react"

const AttachmentPreviewModal = ({ file, onClose }) => {
  if (!file) return null

  const getFileIcon = () => {
    if (file.mimetype?.startsWith("image/")) {
      return <ImageIcon className="h-16 w-16 text-blue-300" />
    } else if (file.mimetype === "application/pdf") {
      return <FileText className="h-16 w-16 text-red-300" />
    } else {
      return <File className="h-16 w-16 text-slate-300" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {file.originalName || "File Preview"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {file.mimetype?.startsWith("image/") ? (
            <div className="bg-slate-100 rounded-lg p-2 flex items-center justify-center">
              <img
                src={file.url || "/placeholder.svg"}
                alt={file.originalName}
                className="max-w-full max-h-[70vh] object-contain rounded-md shadow-md"
              />
            </div>
          ) : file.mimetype === "application/pdf" ? (
            <div className="bg-slate-100 rounded-lg p-2 h-[70vh]">
              <iframe src={file.url} className="w-full h-full rounded-md shadow-md" title="PDF Preview" />
            </div>
          ) : (
            <div className="bg-slate-100 p-12 rounded-lg text-center">
              {getFileIcon()}
              <p className="text-slate-600 mt-4 mb-6">Preview not available for this file type</p>
              <div className="flex justify-center">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" /> Open in new tab
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {file.mimetype || "Unknown file type"}
          </div>
          <a
            href={file.url}
            download={file.originalName}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </div>
      </div>
    </div>
  )
}

export default AttachmentPreviewModal
