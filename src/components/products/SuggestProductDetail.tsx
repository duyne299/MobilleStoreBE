"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProduct';

interface SuggestedProductsProps {
  categoryId: number;
  excludeProductId?: number; // ID sản phẩm hiện tại để loại trừ
  title?: string;
}

// Main Suggested Products Component
export default function SuggestedProducts({
  categoryId,
  excludeProductId,
  title = "Sản phẩm tương tự",
}: SuggestedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
  const { getByCategoryId, loading } = useProducts();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load sản phẩm theo categoryId
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const categoryProducts = await getByCategoryId(categoryId);
        
        if (!Array.isArray(categoryProducts) || categoryProducts.length === 0) {
          setProducts([]);
          return;
        }

        // Loại trừ sản phẩm hiện tại nếu có
        let filteredProducts = categoryProducts;
        if (excludeProductId) {
          filteredProducts = categoryProducts.filter(
            (product) => product.proId !== excludeProductId
          );
        }

        // Shuffle ngẫu nhiên mảng
        const shuffled = [...filteredProducts].sort(() => Math.random() - 0.5);
        // Lấy tối đa 8 sản phẩm
        const selectedProducts = shuffled.slice(0, 8);

        // Tính toán giá và tồn kho từ variants
        const productsWithDetails = selectedProducts.map((product: any) => {
          const variants = product.variants || [];
          const availableVariants = variants.filter((v: any) => v.quantity > 0 && (v.isActive ?? v.active));

          let lowestPrice = product.price || 0;
          if (availableVariants.length > 0) {
            lowestPrice = Math.min(...availableVariants.map((v: any) => v.baseSalePrice));
          } else if (variants.length > 0) {
            lowestPrice = Math.min(...variants.map((v: any) => v.baseSalePrice));
          }

          return {
            ...product,
            baseSalePrice: lowestPrice,
            hasStock: availableVariants.length > 0
          };
        });

        setProducts(productsWithDetails);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setProducts([]);
      }
    };

    if (categoryId) {
      loadProducts();
    }
  }, [categoryId, excludeProductId, getByCategoryId]);

  // Format giá VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const itemsPerView = isMobile ? 2 : 5;
  const maxIndex = Math.max(0, products.length - itemsPerView);

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

  if (loading && products.length === 0) {
    return (
      <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
          <div className="p-8 text-center">
            <div className="text-gray-500">Đang tải sản phẩm...</div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="sm:px-12 md:px-16 lg:px-30 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:rounded-2xl bg-white">
        <div className="flex items-center justify-between mb-2 sm:mb-6 pt-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <button className="text-red-600 text-sm sm:text-base font-medium hover:underline">
            Xem tất cả &gt;
          </button>
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
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-2 sm:gap-3"
              animate={{
                x: `-${currentIndex * (100 / itemsPerView)}%`
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {products.map((product, index) => {
                const basePrice = product.baseSalePrice ?? product.price ?? 0;
                const hasStock = product.hasStock;

                const rawCover = product.images?.find((img: any) => img.isCover) || product.images?.[0] || product.mainImage;
                const coverImage = typeof rawCover === 'string' ? rawCover : rawCover?.imageUrl;

                const transformedProduct = {
                  id: product.proId,
                  name: product.proName,
                  image: coverImage
                    ? (coverImage || '').startsWith('http')
                      ? coverImage
                      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${coverImage}`
                    : "https://placehold.co/400x400?text=No+Image",
                  originalPrice: formatPrice(basePrice),
                  price: formatPrice(basePrice),
                  slug: product.slug,
                  discount: "",
                  savedAmount: "",
                  rating: product.rating || 4.5,
                  ratingCount: Math.floor(Math.random() * 1000) + 100,
                  hasStock: hasStock,
                  specs: product.specs || [],
                };

                return (
                  <div
                    key={product.proId}
                    className="flex-shrink-0"
                    style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * (isMobile ? 8 : 12) / itemsPerView}px)` }}
                  >
                    <ProductCard product={transformedProduct} />
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}