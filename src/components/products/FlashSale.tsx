"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProduct";
import { productService } from "@/services/productService";

const FlashSale = () => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 50,
    seconds: 8,
  });

  const { getByCategoryId, loading } = useProducts();
  const [products, setProducts] = useState<any[]>([]);

  // Load sản phẩm
  useEffect(() => {
    const loadProducts = async () => {
      try {
        let allProducts: any[] = [];

        // Thử lấy theo categoryId 4-11
        for (let categoryId = 4; categoryId <= 11; categoryId++) {
          try {
            const categoryProducts = await getByCategoryId(categoryId);
            if (Array.isArray(categoryProducts)) {
              allProducts.push(...categoryProducts);
            }
          } catch (err) {
            // ignore
          }
        }

        // Fallback lấy toàn bộ sản phẩm
        if (allProducts.length === 0) {
          const res = await productService.getAll({ page: 1, limit: 10 });
          allProducts = res.data;
        }

        if (allProducts.length === 0) return;

        // Shuffle ngẫu nhiên mảng
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
        const randomFive = shuffled.slice(0, 5);

        // Tính toán thông tin giá và tồn kho từ variants
        const productsWithDetails = randomFive.map((product: any) => {
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

        setProducts(productsWithDetails);
      } catch (error) {
        console.error("Lỗi khi tải FlashSale:", error);
      }
    };

    loadProducts();
  }, [getByCategoryId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev + 1 >= Math.ceil(products.length / 2) ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev - 1 < 0 ? Math.ceil(products.length / 2) - 1 : prev - 1,
    );
  };

  // Format giá VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Tính giá khuyến mãi (giảm 15-25% ngẫu nhiên)
  const calculateDiscount = (price: number, index: number) => {
    const discounts = [22, 21, 15, 17, 24];
    const discountPercent = discounts[index % discounts.length];
    return {
      newPrice: Math.round(price * (1 - discountPercent / 100)),
      discount: `-${discountPercent}%`,
    };
  };

  if (loading && products.length === 0) {
    return (
      <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl overflow-hidden p-8 text-center">
            <div className="text-gray-500">Đang tải sản phẩm...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Header với tabs */}
          <div className="p-4 bg-gradient-to-r from-red-100 to-orange-100">
            <div className="flex flex-col items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <motion.h3
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl sm:text-3xl font-bold text-red-600 text-center"
                >
                  Giảm giá sốc
                </motion.h3>

                <div className="flex items-center justify-center mt-2">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold flex items-center">
                    <span className="text-lg">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="mx-1">:</span>
                    <span className="text-lg">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="mx-1">:</span>
                    <span className="text-lg">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Nội dung sản phẩm */}
          <div className="p-4 md:p-6 bg-white">
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.proId}
                  product={product}
                  index={index}
                  formatPrice={formatPrice}
                  calculateDiscount={calculateDiscount}
                  router={router}
                />
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({
                    length: Math.ceil(products.length / 2),
                  }).map((_, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="w-full flex-shrink-0 flex gap-4 px-2"
                    >
                      {products
                        .slice(slideIndex * 2, slideIndex * 2 + 2)
                        .map((product, idx) => (
                          <div
                            key={product.proId}
                            className="w-1/2 flex-shrink-0"
                          >
                            <ProductCard
                              product={product}
                              index={idx}
                              formatPrice={formatPrice}
                              calculateDiscount={calculateDiscount}
                              router={router}
                            />
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {products.length > 2 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-10 hover:bg-gray-100 active:scale-95"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-10 hover:bg-gray-100 active:scale-95"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Dots indicator */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({
                      length: Math.ceil(products.length / 2),
                    }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentSlide === index ? "bg-red-600 w-6" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({
  product,
  index,
  formatPrice,
  calculateDiscount,
  router,
}: {
  product: any;
  index: number;
  formatPrice: (price: number) => string;
  calculateDiscount: (
    price: number,
    index: number,
  ) => { newPrice: number; discount: string };
  router: any;
}) => {
  // Sử dụng baseSalePrice từ warehouse thay vì price từ product
  const basePrice = product.baseSalePrice ?? product.price ?? 0;
  const { newPrice, discount } = calculateDiscount(basePrice, index);

  // Kiểm tra còn hàng
  const hasStock =
    product.warehouseData &&
    product.warehouseData.some((w: any) => w.quantity > 0);

  const handleViewProduct = () => {
    if (hasStock && product.slug) {
      router.push(`/product/${product.slug}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:border relative"
    >
      {/* Out of stock overlay */}
      {!hasStock && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-10 flex items-center justify-center">
          <span className="text-white font-bold text-lg">Hết hàng</span>
        </div>
      )}

      {/* Product Image */}
      <div className="p-6 relative aspect-square flex items-center justify-center overflow-hidden">
        {(() => {
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
          return (
            <img
              src={
                coverImage
                  ? coverImage.startsWith("http")
                    ? coverImage
                    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${coverImage}`
                  : "https://placehold.co/400x400?text=No+Image"
              }
              alt={product.proName}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          );
        })()}
      </div>

      {/* Product Info */}
      <div className="p-1">
        <div
          className="rounded-md overflow-hidden"
          style={{
            backgroundImage:
              "url(https://fptshop.com.vn/img/Price-GVGS.png?w=1920&q=75)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          {/* Price Section */}
          <div className="relative flex flex-col mb-3 text-white">
            <div className="flex items-center justify-between p-2">
              {/* Giá mới */}
              <div className="text-xl md:text-xl font-bold text-white">
                {formatPrice(newPrice)}
              </div>

              {/* Discount */}
              <div className="text-red-700 px-1 py-0.5 rounded text-xl font-bold mt-2">
                {discount}
              </div>
            </div>

            {/* Giá cũ */}
            <div className="text-xs text-gray-300 line-through -mt-2 ml-2">
              {formatPrice(basePrice)}
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="text-xs md:text-sm font-medium text-gray-800 mb-3 line-clamp-2 min-h-[40px]">
          {product.proName}
        </div>

        <button
          onClick={handleViewProduct}
          className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all ${
            hasStock
              ? "bg-white text-red-500 hover:bg-red-50"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          style={hasStock ? { border: "1px solid #ef4444" } : {}}
          disabled={!hasStock}
        >
          {hasStock ? "Xem ngay" : "Hết hàng"}
        </button>
      </div>
    </motion.div>
  );
};

export default FlashSale;
