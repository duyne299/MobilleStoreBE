"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import { productService } from "@/services/productService";

export default function ProductListHome() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadProducts = async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await productService.getAll({ page: pageNum, limit });
      const newProducts = res.data;

      if (newProducts.length < limit) {
        setHasMore(false);
      }

      // Tính toán giá và tồn kho từ variants
      const productsWithDetails = newProducts.map((product: any) => {
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
          lowestPrice = Math.min(...variants.map((v: any) => v.baseSalePrice));
        }

        return {
          ...product,
          baseSalePrice: lowestPrice,
          hasStock: availableVariants.length > 0,
        };
      });

      if (pageNum === 1) {
        setProducts(productsWithDetails);
      } else {
        setProducts((prev) => [...prev, ...productsWithDetails]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = (price: number, index: number) => {
    const discounts = [5, 7, 8, 10, 11, 12];
    const discountPercent = discounts[index % discounts.length];
    return {
      newPrice: Math.round(price * (1 - discountPercent / 100)),
      discount: `-${discountPercent}%`,
      savedAmount: Math.round((price * discountPercent) / 100),
    };
  };

  return (
    <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-red-600 pl-4 uppercase">
            Danh sách sản phẩm
          </h2>
          <button
            onClick={() => router.push("/product")}
            className="text-red-600 font-medium hover:underline flex items-center gap-1"
          >
            Xem tất cả
            <svg
              className="w-4 h-4"
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, index) => {
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
              if (typeof product.images[0] === "string") {
                coverImage = product.images[0];
              } else {
                coverImage =
                  product.images.find((img: any) => img.isCover)?.imageUrl ||
                  product.images[0]?.imageUrl;
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
              installment: true,
              rating: product.rating || 5,
              ratingCount: Math.floor(Math.random() * 500) + 50,
              specs: [], // Có thể bổ sung nếu cần
              hasStock: hasStock,
            };

            return (
              <motion.div
                key={`${product.proId}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: (index % limit) * 0.05 }}
              >
                <ProductCard product={transformedProduct} />
              </motion.div>
            );
          })}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              className="px-10 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              Xem thêm sản phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
