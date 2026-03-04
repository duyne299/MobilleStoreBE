"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBanners } from '@/hooks/useBanner';

const ProductSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const { banners, loading } = useBanners(100);

  // Filter banners với position TOP
  const topBanners = banners.filter(b => b.position === 'TOP' && b.isActive);

  // Auto slide
  useEffect(() => {
    if (topBanners.length === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, topBanners.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % topBanners.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + topBanners.length) % topBanners.length);
  };

  const goToSlide = (index:any) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slideVariants = {
    enter: (direction:any) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction:any) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  if (loading) {
    return (
      <div className="relative w-full max-w-7xl mx-auto px-4 py-8">
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-200 animate-pulse">
        </div>
      </div>
    );
  }

  if (topBanners.length === 0) {
    return (
      <div className="relative w-full max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-500">
          Chưa có banner nào được kích hoạt
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-8">
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
        {/* Slides */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              if (topBanners[currentSlide]?.linkTarget) {
                window.open(topBanners[currentSlide].linkTarget, '_blank');
              }
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${topBanners[currentSlide]?.imageUrl}`}
              alt={topBanners[currentSlide]?.title || `Slide ${currentSlide + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </motion.div>
        </AnimatePresence>

        {/* Previous Button */}
        {topBanners.length > 1 && (
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
        )}

        {/* Next Button */}
        {topBanners.length > 1 && (
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRight size={24} className="text-gray-800" />
          </button>
        )}

        {/* Dots Indicator */}
        {topBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {topBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentSlide
                    ? 'bg-white w-8 h-3'
                    : 'bg-white/50 w-3 h-3 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSlider;