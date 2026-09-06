import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function ImageLightboxModal({ isOpen, onClose, images, activeIndex = 0 }) {
  if (!isOpen || !images || images.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentImg = images[currentIndex] || images[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[88vh] max-h-[760px] overflow-hidden shadow-2xl flex flex-col text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded uppercase">
                High-Resolution Clinical Figure
              </span>
              <span className="text-xs text-slate-400">
                Figure {currentIndex + 1} of {images.length}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 truncate max-w-xl">
              {currentImg.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700">
              <button 
                onClick={handleZoomOut}
                className="p-1 hover:text-brand-400" 
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5">{Math.round(zoomLevel * 100)}%</span>
              <button 
                onClick={handleZoomIn}
                className="p-1 hover:text-brand-400" 
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={handleResetZoom}
                className="p-1 hover:text-brand-400 border-l border-slate-700 ml-1 pl-1.5" 
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display Area with Pan & Zoom */}
        <div className="flex-grow bg-black flex items-center justify-center p-4 relative overflow-hidden select-none">
          
          {/* Previous image button */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-brand-600 text-white flex items-center justify-center transition-all border border-slate-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Active Image */}
          <div 
            className="transition-transform duration-200 flex items-center justify-center max-w-full max-h-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={currentImg.url}
              alt={currentImg.title}
              className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          </div>

          {/* Next image button */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-brand-600 text-white flex items-center justify-center transition-all border border-slate-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

        </div>

        {/* Clinical Caption Bar */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 shrink-0">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentImg.caption}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
