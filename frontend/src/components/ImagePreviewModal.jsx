import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight, FaSearchPlus } from 'react-icons/fa';

const ImagePreviewModal = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
        >
          <FaTimes className="text-2xl" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all hidden md:block"
            >
              <FaChevronLeft className="text-2xl" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all hidden md:block"
            >
              <FaChevronRight className="text-2xl" />
            </button>
          </>
        )}

        <div className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden px-4">
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            src={images[currentIndex].url || images[currentIndex]}
            alt={`Preview ${currentIndex + 1}`}
            className={`max-w-full max-h-full object-contain ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'} transition-transform duration-300`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
          {!isZoomed && (
             <div className="absolute bottom-4 right-8 text-white/50 flex items-center gap-2 text-sm bg-black/50 px-3 py-1 rounded-full pointer-events-none">
               <FaSearchPlus /> Click to zoom
             </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-6 w-full px-4">
             <div className="flex justify-center gap-3 overflow-x-auto py-4 snap-x">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setIsZoomed(false); }}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden snap-center transition-all duration-300 border-2 ${idx === currentIndex ? 'border-brand-500 scale-110 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img.url || img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImagePreviewModal;
