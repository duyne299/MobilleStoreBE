"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBanners } from "@/hooks/useBanner";

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  const { banners, loading } = useBanners(100);

  // Filter banners với position MID và isActive
  const midBanners = banners.filter((b) => b.position === "MID" && b.isActive);

  // Cập nhật số banner hiển thị dựa trên kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 banner
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 banners
      } else {
        setItemsPerView(3); // Desktop: 3 banners
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, midBanners.length - itemsPerView);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto slide
  useEffect(() => {
    if (isHovered || midBanners.length <= itemsPerView) return;
    const timer = setInterval(() => handleNext(), 3000);
    return () => clearInterval(timer);
  }, [isHovered, currentIndex, maxIndex, midBanners.length]);

  // Tính toán translateX dựa trên pixel thực tế
  const getTranslateX = () => {
    if (!containerRef.current) return 0;

    const containerWidth = containerRef.current.offsetWidth;
    const gap = itemsPerView === 1 ? 0 : 12; // 12px gap
    const totalGaps = itemsPerView - 1;
    const itemWidth = (containerWidth - totalGaps * gap) / itemsPerView;
    const moveDistance = (itemWidth + gap) * currentIndex;

    return moveDistance;
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 bg-gray-200 animate-pulse rounded-lg"
              style={{ height: "144px" }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Không có banner
  if (midBanners.length === 0) {
    return null; // Hoặc có thể return message
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-9 py-4">
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Container chứa các banner */}
        <div className="relative w-full" ref={containerRef}>
          <motion.div
            className="flex gap-3"
            animate={{
              x: -getTranslateX(),
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
          >
            {midBanners.map((banner) => (
              <div
                key={banner.bannerId}
                className="rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow flex-shrink-0"
                style={{
                  width:
                    itemsPerView === 1
                      ? "100%"
                      : `calc((100% - ${(itemsPerView - 1) * 12}px) / ${itemsPerView})`,
                }}
                onClick={() => {
                  if (banner.linkTarget) {
                    window.open(banner.linkTarget, "_blank");
                  }
                }}
              >
                <img
                  src={
                    banner.imageUrl
                      ? banner.imageUrl.startsWith("http")
                        ? banner.imageUrl
                        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${banner.imageUrl}`
                      : "https://placehold.co/800x400?text=No+Banner+Image"
                  }
                  alt={banner.title || `Banner ${banner.bannerId}`}
                  className="w-full h-24 sm:h-28 md:h-32 lg:h-36 object-cover"
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Buttons - Chỉ hiện khi có nhiều hơn itemsPerView */}
        {isHovered && midBanners.length > itemsPerView && (
          <>
            <button
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
              onClick={handlePrev}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
            <button
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
