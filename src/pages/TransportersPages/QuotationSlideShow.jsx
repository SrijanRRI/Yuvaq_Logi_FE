import React, { useRef, useState } from "react";
import { FileText, Truck, ChevronLeft, ChevronRight, Award, ExternalLink, Clock, IndianRupee } from "lucide-react";

const QuotationSlideshow = ({ quotations }) => {
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const touchStartX = useRef(null);

  // Sort quotations by price (lowest first)
  const sorted = [...(quotations || [])].sort((a, b) => a.price - b.price);
  const current = sorted[index];

  // Handle manual navigation
  const goToSlide = (newIndex) => {
    setTransitioning(true);
    setTimeout(() => {
      setIndex(newIndex);
      setTransitioning(false);
    }, 300);
  };

  const goToPrevious = () => {
    const newIndex = (index - 1 + sorted.length) % sorted.length;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (index + 1) % sorted.length;
    goToSlide(newIndex);
  };

  // Touch handlers for mobile swiping
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left, go next
        goToNext();
      } else {
        // Swipe right, go previous
        goToPrevious();
      }
    }

    touchStartX.current = null;
  };

  if (!current) return null;

  const isLowestPrice = index === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-200" />
            <span>Quotation Summary</span>
          </h4>
          <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
            <span className="text-white font-medium">
              {index + 1}/{sorted.length}
            </span>
          </div>
        </div>
      </div>

      <div 
        className="relative overflow-hidden" 
        onTouchStart={handleTouchStart} 
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`p-5 transform transition-all duration-300 ease-in-out ${
            transitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {isLowestPrice && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium">Lowest Price</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200 shadow-sm hover:shadow transition-all group">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-200 p-3 rounded-full shadow-inner group-hover:shadow transition-all">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium mb-1">Price</p>
                <p className="text-2xl font-bold text-gray-800">₹ {current.price.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow transition-all group">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-3 rounded-full shadow-inner group-hover:shadow transition-all">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Vehicle</p>
                <p className="font-medium text-gray-800">{current.vehicleNumber}</p>
              </div>
            </div>
          </div>

          {current.files?.length > 0 && (
            <div className="flex items-start gap-4 bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 shadow-sm group hover:shadow transition-all">
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-full shadow-inner mt-1 group-hover:shadow transition-all">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-amber-600 font-medium mb-2">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {current.files.map((file, i) => (
                    <a
                      key={i}
                      href={file.url || file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-full hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-all shadow-sm group-hover:shadow-md"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">
                        {file.originalName || file.name || `File ${i + 1}`}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Dots */}
        {sorted.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 gap-1">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`transition-all ${
                  i === index ? "bg-indigo-600 w-8 h-2 rounded-full shadow-md" : "bg-gray-300 w-2 h-2 rounded-full hover:bg-gray-400 hover:shadow"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Side Navigation Arrows */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-indigo-50 rounded-full p-2.5 shadow-md text-gray-700 hover:text-indigo-600 transition-all border border-gray-200 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              aria-label="Previous quotation"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-indigo-50 rounded-full p-2.5 shadow-md text-gray-700 hover:text-indigo-600 transition-all border border-gray-200 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              aria-label="Next quotation"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      {sorted.length > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={goToPrevious}
            className="px-4 py-2 bg-white hover:bg-indigo-50 rounded-lg shadow-sm text-gray-700 hover:text-indigo-600 transition-all border border-gray-200 hover:border-indigo-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            aria-label="Previous quotation"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium">Previous</span>
          </button>
          <div className="text-sm text-gray-500">
            {index + 1} of {sorted.length}
          </div>
          <button
            onClick={goToNext}
            className="px-4 py-2 bg-white hover:bg-indigo-50 rounded-lg shadow-sm text-gray-700 hover:text-indigo-600 transition-all border border-gray-200 hover:border-indigo-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            aria-label="Next quotation"
          >
            <span className="font-medium">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuotationSlideshow;