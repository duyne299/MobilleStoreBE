"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from '@/components/posts.tsx/PostCard';
import { usePosts } from '@/hooks/usePost';
import Link from 'next/link';

// Main Suggested Posts Component
export default function SuggestedPosts() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Sử dụng hook usePosts để lấy dữ liệu
  const { posts, loading, error } = usePosts(10); // Lấy 8 bài viết

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerView = isMobile ? 2 : 4;
  const maxIndex = Math.max(0, posts.length - itemsPerView);

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const visiblePosts = posts.filter(post => post.isActive ?? true);

  // Không có bài viết
  if (!visiblePosts || visiblePosts.length === 0) {
    return (
      <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Chưa có bài viết nào</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
        <div className="flex items-center justify-between mb-2 sm:mb-6 pt-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tin tức công nghệ
          </h2>

          <Link
            href="/post"
            className="text-red-600 text-sm sm:text-base font-medium hover:underline"
          >
            Xem tất cả &gt;
          </Link>
        </div>

        <div
          className="relative pb-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Buttons */}
          <AnimatePresence>
            {isHovered && canGoPrev && (
              <motion.button
                key="prev-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
            )}

            {isHovered && canGoNext && (
              <motion.button
                key="next-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Carousel Container */}
          <div className="overflow-hidden pb-2">
            <motion.div
              className="flex gap-3 sm:gap-4"
              animate={{
                x: `-${currentIndex * (100 / itemsPerView)}%`
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {visiblePosts.map((post) => (
                <div
                  key={post.postId}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * (isMobile ? 12 : 16) / itemsPerView}px)` }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}