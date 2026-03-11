import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { cn } from '../../utils';

const ProductLightbox = ({ images, isOpen, onClose, initialIndex = 0, productName = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showZoomHint, setShowZoomHint] = useState(true);
  const containerRef = useRef(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setShowZoomHint(true);
      document.body.style.overflow = 'hidden';
      // Hide header when lightbox is open
      const header = document.querySelector('header');
      if (header) {
        header.style.display = 'none';
      }
    } else {
      document.body.style.overflow = 'unset';
      // Show header when lightbox is closed
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      // Show header on cleanup
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, [isOpen, initialIndex]);

  // Hide zoom hint after 3 seconds
  useEffect(() => {
    if (showZoomHint) {
      const timer = setTimeout(() => setShowZoomHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showZoomHint]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, zoomLevel]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  }, [images.length]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    e.preventDefault();
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomLevel((prev) => {
      const newZoom = Math.max(1, Math.min(3, prev + delta));
      if (newZoom <= 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `${productName}-image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[999999] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999999] px-4 py-2 bg-white/10 rounded-full text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Main Image Container */}
          <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center p-16"
            onClick={(e) => e.target === containerRef.current && onClose()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          >
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: zoomLevel }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              draggable={false}
            />

            {/* Zoom Hint */}
            <AnimatePresence>
              {showZoomHint && zoomLevel === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm"
                >
                  Scroll to zoom, drag to pan
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[999999] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[999999] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999999] flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              disabled={zoomLevel <= 1}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full text-white transition-all"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); resetZoom(); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-all"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              disabled={zoomLevel >= 3}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full text-white transition-all"
            >
              <ZoomIn className="h-5 w-5" />
            </button>

            <div className="w-px h-8 bg-white/20 mx-2" />

            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-2xl max-w-[80vw] overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); resetZoom(); }}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    index === currentIndex ? 'border-violet-500 ring-2 ring-violet-500/50' : 'border-transparent hover:border-white/50'
                  )}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Keyboard Shortcuts Hint */}
          <div className="absolute bottom-4 right-4 z-50 text-white/40 text-xs hidden lg:block">
            <p>← → Navigate</p>
            <p>+/- Zoom</p>
            <p>0 Reset</p>
            <p>ESC Close</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductLightbox;
