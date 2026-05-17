"use client";

import { useCategories } from "@/hooks/useCategory";
import { useProducts } from "@/hooks/useProduct";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Headphones,
  Apple,
  Newspaper,
  BadgePercent,
  Star,
  BookOpenText,
  Tablet,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";

const mainCategories = [
  { id: 1, name: "Điện thoại", icon: <Smartphone size={18} /> },
  { id: 2, name: "Máy tính bảng", icon: <Tablet size={18} /> },
  { id: 16, name: "Phụ kiện", icon: <Headphones size={18} /> },
];

const brandCategories = [
  { id: "apple", name: "Apple", icon: <Apple size={20} /> },
  {
    id: "lg",
    name: "LG",
    icon: (
      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
        LG
      </div>
    ),
  },
  {
    id: "samsung",
    name: "Samsung",
    icon: (
      <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold text-xs">
        S
      </div>
    ),
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    icon: (
      <div className="w-5 h-5 bg-orange-500 rounded-sm flex items-center justify-center text-white font-bold text-xs">
        Mi
      </div>
    ),
  },
  {
    id: "garmin",
    name: "Garmin",
    icon: (
      <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center text-white font-bold text-xs">
        G
      </div>
    ),
  },
];

const applianceCategories = [
  { id: 201, name: "Tin công nghệ", icon: <Newspaper size={18} /> },
  { id: 202, name: "Khuyến mãi", icon: <BadgePercent size={18} /> },
  { id: 203, name: "Đánh giá", icon: <Star size={18} /> },
  { id: 204, name: "Hướng dẫn sử dụng", icon: <BookOpenText size={18} /> },
];

interface CategoryMenuProps {
  isPinned?: boolean;
  onPinChange?: (pinned: boolean) => void;
}

export default function CategoryMenu({
  isPinned: externalPinned,
  onPinChange,
}: CategoryMenuProps) {
  const [activeCategory, setActiveCategory] = useState<number | string>(
    mainCategories[0].id,
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    categories,
    loading: loadingCategories,
    fetchCategories,
  } = useCategories(100);
  const {
    products,
    loading: loadingProducts,
    getByCategoryId,
    fetchProducts,
  } = useProducts(1000);
  const [subCategoryProducts, setSubCategoryProducts] = useState<{
    [key: number]: any[];
  }>({});
  const [loadingSubProducts, setLoadingSubProducts] = useState(false);
  const [internalPinned, setInternalPinned] = useState(false);

  // Sử dụng external pinned nếu có, nếu không dùng internal
  const isPinned =
    externalPinned !== undefined ? externalPinned : internalPinned;

  useEffect(() => {
    fetchCategories({ limit: 100 });
  }, []);

  // Xử lý click outside để unpin menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isPinned &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        if (onPinChange) {
          onPinChange(false);
        } else {
          setInternalPinned(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPinned, onPinChange]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handler cho hover với debounce - chỉ hoạt động khi không bị pin
  const handleCategoryHover = (categoryId: number | string) => {
    if (isPinned) return; // Không hover khi đã pin

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(categoryId);
    }, 150);
  };

  // Handler cho click - pin menu và set category
  const handleCategoryClick = (categoryId: number | string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveCategory(categoryId);

    // Pin menu khi click vào category
    if (onPinChange) {
      onPinChange(true);
    } else {
      setInternalPinned(true);
    }
  };

  // Tạo content động cho right side
  const rightContent = useMemo(() => {
    if (!categories.length) return {};

    const content: any = {};

    const getSubcategories = (parentId: number) => {
      return categories.filter(
        (cat) => cat.parentId === parentId && cat.isActive,
      );
    };

    const groupItems = (items: any[]) => {
      if (items.length === 0) return [];
      const itemsPerGroup = Math.ceil(items.length / 3);
      const grouped = [];
      for (let i = 0; i < 3; i++) {
        const start = i * itemsPerGroup;
        const end = start + itemsPerGroup;
        const group = items.slice(start, end);
        if (group.length > 0) grouped.push(group);
      }
      return grouped;
    };

    mainCategories.forEach((main) => {
      if (main.id === 3) return;
      const subs = getSubcategories(main.id);
      const items = subs.map((sub) => ({
        name: sub.categoryName,
        products: subCategoryProducts[sub.categoryId] ?? [],
      }));
      content[main.id] = groupItems(items);
    });

    const accessoriesCategory = mainCategories.find((m) => m.id === 3);
    if (accessoriesCategory) {
      const subs = getSubcategories(3);
      content[3] = [
        subs.slice(0, Math.ceil(subs.length / 3)).map((sub) => ({
          name: sub.categoryName,
          products: [],
        })),
        subs
          .slice(Math.ceil(subs.length / 3), Math.ceil((subs.length * 2) / 3))
          .map((sub) => ({
            name: sub.categoryName,
            products: [],
          })),
        subs.slice(Math.ceil((subs.length * 2) / 3)).map((sub) => ({
          name: sub.categoryName,
          products: [],
        })),
      ].filter((group) => group.length > 0);
    }

    brandCategories.forEach((brand) => {
      const cat = categories.find((c) => c.slug === brand.id && c.isActive);
      if (!cat) return;
      const subs = getSubcategories(cat.categoryId);
      const items = subs.map((sub) => ({
        name: sub.categoryName,
        products: subCategoryProducts[sub.categoryId] || [],
      }));
      content[brand.id] = groupItems(items);
    });

    applianceCategories.forEach((app) => {
      const cat = categories.find((c) => c.categoryId === app.id && c.isActive);
      if (!cat) return;
      const subs = getSubcategories(cat.categoryId);
      const items = subs.map((sub) => ({
        name: sub.categoryName,
        products: subCategoryProducts[sub.categoryId] || [],
      }));
      content[app.id] = groupItems(items);
    });

    return content;
  }, [categories, subCategoryProducts]);

  return (
    <div className="relative" ref={menuRef}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 top-[-30px] w-full md:w-[700px] lg:w-[900px] bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200 max-h-[80vh] md:max-h-[500px]"
        >
          <div className="flex flex-col md:flex-row h-full md:h-[500px]">
            {/* Left Side - Main Categories */}
            <div className="w-full md:w-1/3 bg-white border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto max-h-[300px] md:max-h-full">
              <div className="p-3 md:p-4 space-y-0.5">
                {mainCategories.map((category) => (
                  <div
                    key={category.id}
                    onMouseEnter={() => handleCategoryHover(category.id)}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center px-3 py-2.5 cursor-pointer transition-colors ${
                      activeCategory === category.id
                        ? "bg-gray-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-gray-700 mr-3">{category.icon}</span>
                    <span className="text-sm font-normal text-gray-800">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-3 md:px-4 py-3 border-gray-100">
                <div className="flex items-center mb-3">
                  <h4 className="text-xs font-normal text-gray-500 whitespace-nowrap">
                    Thương hiệu
                  </h4>
                  <div className="flex-1 border-b border-gray-200 ml-3"></div>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full">
                  {brandCategories.map((brand) => (
                    <div
                      key={brand.id}
                      onMouseEnter={() => handleCategoryHover(brand.id)}
                      onClick={() => handleCategoryClick(brand.id)}
                      className={`flex items-center gap-2 w-full py-2.5 hover:bg-gray-100 cursor-pointer transition-colors rounded-md ${
                        activeCategory === brand.id ? "bg-gray-100" : ""
                      }`}
                    >
                      <span className="flex-shrink-0">{brand.icon}</span>
                      <span className="text-sm font-normal text-gray-800">
                        {brand.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appliances Section */}
              <div className="px-3 md:px-4 py-3 border-gray-100">
                <div className="flex items-center mb-3">
                  <h4 className="text-xs font-normal text-gray-500 whitespace-nowrap">
                    Bài viết
                  </h4>
                  <div className="flex-1 border-b border-gray-200 ml-3"></div>
                </div>
                <div className="space-y-0.5">
                  {applianceCategories.map((category) => (
                    <div
                      key={category.id}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`flex items-center px-3 py-2.5 cursor-pointer transition-colors ${
                        activeCategory === category.id
                          ? "bg-gray-100"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-gray-700 mr-3">
                        {category.icon}
                      </span>
                      <span className="text-sm font-normal text-gray-800">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Subcategories */}
            <div className="w-full md:w-2/3 p-4 md:p-5 overflow-y-auto">
              {loadingSubProducts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-black text-base md:text-lg font-semibold mb-3 md:mb-4">
                    🔥 Gợi ý cho bạn
                  </h3>

                  {rightContent[activeCategory] &&
                  rightContent[activeCategory].length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {rightContent[activeCategory].map(
                        (group: any[], idx: number) => (
                          <div key={idx} className="space-y-3">
                            {group.map((item: any, i: number) => (
                              <div key={i}>
                                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base flex items-center">
                                  {item.name}
                                  <span className="ml-1">›</span>
                                </h4>

                                <div className="grid grid-cols-1 gap-1.5">
                                  {item.products && item.products.length > 0 ? (
                                    item.products.map(
                                      (product: any, j: number) => (
                                        <span
                                          key={j}
                                          className="text-xs md:text-sm text-gray-600 hover:text-blue-600 cursor-pointer truncate block"
                                          title={
                                            product.proName ||
                                            product.name ||
                                            "Sản phẩm"
                                          }
                                        >
                                          {product.proName ||
                                            product.name ||
                                            "Sản phẩm không có tên"}
                                        </span>
                                      ),
                                    )
                                  ) : (
                                    <span className="text-xs md:text-sm text-gray-400 italic">
                                      Chưa có sản phẩm
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Chưa có danh mục con</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
