"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: any }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  // Kiểm tra có màu sắc không
  const hasColors = product.colors && Array.isArray(product.colors) && product.colors.length > 0;

  // Icon URLs mặc định
  const defaultIcons = [
    "https://cdn2.fptshop.com.vn/svg/ic_chipset_5e2f01b828.svg",
    "https://cdn2.fptshop.com.vn/svg/ic_cam_a9461d9c4e.svg",
    "https://cdn2.fptshop.com.vn/svg/ic_battery_charge_c0e32235b5.svg"
  ];

  // Kiểm tra có specs và specs có text không
  const hasValidSpecs = product.specs && 
    Array.isArray(product.specs) && 
    product.specs.length > 0 &&
    product.specs.some((spec: any) => spec?.text && String(spec.text).trim() !== '');

  // Map specs với icon mặc định, chỉ lấy specs có text
  const specsWithIcons = hasValidSpecs
    ? product.specs
        .filter((spec: any) => spec?.text && String(spec.text).trim() !== '')
        .slice(0, 3)
        .map((spec: any, index: number) => ({
          icon: defaultIcons[index] || defaultIcons[0],
          text: String(spec.text)
        }))
    : [];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border hover:border-red-500 h-full"
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      <div className="p-3 h-full flex flex-col">
        {/* Image and Specs Container */}
        <div className={`${hasValidSpecs ? 'flex gap-2 sm:gap-3' : ''} mb-3`}>
          {/* Image Container */}
          <div className={`relative flex items-center justify-center bg-white overflow-hidden ${
            hasValidSpecs
              ? 'w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0'
              : 'w-full h-32 sm:h-40'
          }`}>
            <motion.img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Specs Icons - Chỉ hiển thị khi có spec text */}
          {hasValidSpecs && specsWithIcons.length > 0 && (
            <div className="flex flex-col justify-center gap-1 sm:gap-1.5 flex-1">
              {specsWithIcons.map((spec: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <img
                      src={spec.icon}
                      alt=""
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain"
                    />
                  </div>
                  <span className="text-[8px] sm:text-[9px] text-gray-700 font-medium text-center leading-tight">
                    {spec.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className={`space-y-1 mb-2 ${hasValidSpecs ? 'mt-12' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through text-xs">
              {product.originalPrice}
            </span>
            <span className="text-red-600 font-bold text-xs">
              {product.discount}
            </span>
            
            {/* Favorite Icon */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="ml-auto w-7 h-7 bg-[#FEE2E2] rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`}
              />
            </motion.button>
          </div>
          
          <div className="text-lg font-bold text-gray-900">
            {product.price}
          </div>
          
          <div className="text-xs text-green-600 font-medium">
            Giảm {product.savedAmount}
          </div>
        </div>

        {/* Product Name - flex-grow để đẩy các phần tử phía dưới xuống đáy */}
        <h3 className="text-xs text-gray-800 line-clamp-2 leading-snug mb-2 flex-grow">
          {product.name}
        </h3>

        {/* Color Options - Hiển thị nếu có màu */}
        {hasColors && (
          <div className="flex items-center gap-1.5 mb-2">
            {product.colors.map((color: string, index: number) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}

        {/* Rating Section */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-3 h-3 ${
                  index < Math.floor(product.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 fill-gray-300'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-600">  
            ({product.rating || 0})
          </span>
        </div>
      </div>
    </motion.div>
  );
}