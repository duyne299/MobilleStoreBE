"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { brandService } from "@/services/brandService";

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}

export default function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: any;
  }>({
    category: true,
    brand: true,
    price: true,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryService.getAll({ page: 1, limit: 100 }),
          brandService.findAll({ page: 1, limit: 100 }),
        ]);

        if (catRes?.data) {
          setCategories(
            catRes.data
              .filter((c: any) => c.isActive !== false)
              .map((c: any) => c.categoryName)
          );
        }
        if (brandRes?.data) {
          setBrands(
            brandRes.data
              .filter((b: any) => b.isActive !== false)
              .map((b: any) => b.brandName)
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu lọc:", error);
      }
    };
    fetchData();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(
      selectedBrands.includes(brand)
        ? selectedBrands.filter((b) => b !== brand)
        : [...selectedBrands, brand],
    );
  };

  const handlePriceRangeChange = (index: number, value: string) => {
    const newRange = [...priceRange];
    newRange[index] = Number(value);
    setPriceRange(newRange);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <div className="bg-white">
      {/* Loại sản phẩm */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("category")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-medium">Loại sản phẩm</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.category ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hãng sản xuất */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("brand")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-medium">Hãng sản xuất</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.brand ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.brand && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedBrands.includes(brand)
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mức giá */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("price")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-medium">Mức giá</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.price ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="space-y-2 mb-4">
                  {[
                    { label: "Tất cả", min: 0, max: 64000000 },
                    { label: "Dưới 2 triệu", min: 0, max: 2000000 },
                    { label: "Từ 2 - 4 triệu", min: 2000000, max: 4000000 },
                    { label: "Từ 4 - 7 triệu", min: 4000000, max: 7000000 },
                    { label: "Từ 7 - 13 triệu", min: 7000000, max: 13000000 },
                    { label: "Từ 13 - 20 triệu", min: 13000000, max: 20000000 },
                    { label: "Trên 20 triệu", min: 20000000, max: 64000000 },
                  ].map((range, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={
                          priceRange[0] === range.min &&
                          priceRange[1] === range.max
                        }
                        onChange={() => setPriceRange([range.min, range.max])}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="64000000"
                    step="1000000"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="range"
                    min="0"
                    max="64000000"
                    step="1000000"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Từ"
                  />
                  <span>~</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Đến"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
