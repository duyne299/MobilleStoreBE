"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProduct";
import { productService } from "@/services/productService";

// Main Suggested Accessories Component
export default function SuggestedAccessories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [accessories, setAccessories] = useState<any[]>([]);

  const { getByCategoryId, loading } = useProducts();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load sản phẩm phụ kiện
  useEffect(() => {
    const loadAccessories = async () => {
      try {
        let allAccessories: any[] = [];

        // Thử lấy theo categoryId 17-21
        for (let categoryId = 17; categoryId <= 21; categoryId++) {
          try {
            const categoryProducts = await getByCategoryId(categoryId);
            if (Array.isArray(categoryProducts)) {
              allAccessories.push(...categoryProducts);
            }
          } catch (err) {
            // ignore
          }
        }

        // Fallback lấy toàn bộ sản phẩm
        if (allAccessories.length === 0) {
          const res = await productService.getAll({ page: 1, limit: 10 });
          allAccessories = res.data;
        }

        if (allAccessories.length === 0) return;

        // Shuffle ngẫu nhiên mảng
        const shuffled = [...allAccessories].sort(() => Math.random() - 0.5);
        const randomAccessories = shuffled.slice(0, 8);

        // Tính toán giá và tồn kho từ variants
        const accessoriesWithDetails = randomAccessories.map((product: any) => {
          const variants = product.variants || [];
          const availableVariants = variants.filter(
            (v: any) => v.quantity > 0 && (v.isActive ?? v.active),
          );

          let lowestPrice = product.price || 0;
          if (availableVariants.length > 0) {
            lowestPrice = Math.min(
              ...availableVariants.map((v: any) => v.baseSalePrice),
            );
          } else if (variants.length > 0) {
            lowestPrice = Math.min(
              ...variants.map((v: any) => v.baseSalePrice),
            );
          }

          return {
            ...product,
            baseSalePrice: lowestPrice,
            hasStock: availableVariants.length > 0,
          };
        });

        setAccessories(accessoriesWithDetails);
      } catch (error) {
        console.error("Lỗi khi tải phụ kiện:", error);
      }
    };

    loadAccessories();
  }, [getByCategoryId]);

  // Format giá VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Tính giá khuyến mãi
  const calculateDiscount = (price: number, index: number) => {
    const discounts = [15, 15, 30, 20, 25, 25, 20, 30];
    const discountPercent = discounts[index % discounts.length];
    return {
      newPrice: Math.round(price * (1 + discountPercent / 100)),
      discount: `-${discountPercent}%`,
      savedAmount: Math.round((price * discountPercent) / 100),
    };
  };

  const handleViewAll = () => {
    router.push("/product?category=Phụ kiện");
  };

  const itemsPerView = isMobile ? 2 : 5;
  const maxIndex = Math.max(0, accessories.length - itemsPerView);

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  if (loading && accessories.length === 0) {
    return (
      <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
          <div className="p-8 text-center">
            <div className="text-gray-500">Đang tải phụ kiện...</div>
          </div>
        </div>
      </div>
    );
  }

  if (accessories.length === 0) {
    return null;
  }
  return (
    <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
        <div className="flex items-center justify-between mb-2 sm:mb-6 pt-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Phụ kiện cho bạn
          </h2>
          <button
            onClick={handleViewAll}
            className="text-red-600 text-sm sm:text-base font-medium hover:underline transition-all hover:text-red-700"
          >
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
                x: `-${currentIndex * (100 / itemsPerView)}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              {accessories.map((product, index) => {
                const basePrice = product.baseSalePrice ?? product.price ?? 0;
                const { newPrice, discount, savedAmount } = calculateDiscount(
                  basePrice,
                  index,
                );
                const hasStock =
                  product.warehouseData &&
                  product.warehouseData.some((w: any) => w.quantity > 0);

                let coverImage = null;
                if (product.images && product.images.length > 0) {
                  if (typeof product.images[0] === 'string') {
                    coverImage = product.images[0];
                  } else {
                    coverImage = product.images.find((img: any) => img.isCover)?.imageUrl || product.images[0]?.imageUrl;
                  }
                }
                if (!coverImage) {
                  coverImage = product.mainImage;
                }
                const transformedProduct = {
                  id: product.proId,
                  name: product.proName,
                  slug: product.slug,
                  image: coverImage
                    ? coverImage.startsWith("http")
                      ? coverImage
                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${coverImage}`
                    : "https://placehold.co/400x400?text=No+Image",
                  originalPrice: formatPrice(basePrice),
                  price: formatPrice(newPrice),
                  discount: discount,
                  savedAmount: formatPrice(savedAmount),
                  rating: product.rating || 4.5,
                  ratingCount: Math.floor(Math.random() * 1000) + 100,
                  hasStock: hasStock,
                  // Không có specs cho phụ kiện
                };

                return (
                  <div
                    key={product.proId}
                    className="flex-shrink-0"
                    style={{
                      width: `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * (isMobile ? 8 : 12)) / itemsPerView}px)`,
                    }}
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
