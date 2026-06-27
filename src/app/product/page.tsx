"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProduct";
import { productService } from "@/services/productService";
import { useProductVariants } from "@/hooks/useVariant";
import FilterSidebar from "@/components/ui/FilterSidebar";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { brandService } from "@/services/brandService";
import { AutoHideHeader } from "@/components/ui/AutoHideHeader";
import ProductSlider from "@/components/banners/ProductSlide";
import { useSearchParams } from "next/navigation";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";

function ProductPageContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search"); // Lấy search query từ URL

  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl || "Điện thoại",
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 64000000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || ""); // State cho search query

  const itemsPerPage = 16;

  const { fetchProducts } = useProducts(100);
  const {} = useProductVariants();

  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandService.findAll({ page: 1, limit: 100 });
        if (res?.data) {
          setBrands(res.data.map((b: any) => b.brandName));
        }
      } catch (err) {
        console.error("Lỗi tải thương hiệu:", err);
      }
    };
    fetchBrands();
  }, []);

  // Categories mapping
  const categoryMap: Record<string, number | number[]> = {
    "Điện thoại": [3, 4, 5, 6, 7, 8],
    Tablet: [9, 10, 11, 12, 13, 14, 15],
    "Phụ kiện": [17, 18, 19, 20, 21],
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  // Update search query when URL changes
  useEffect(() => {
    const newSearchQuery = searchParams.get("search");
    if (newSearchQuery !== searchQuery) {
      setSearchQuery(newSearchQuery || "");
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Update selected category when URL changes
  useEffect(() => {
    const newCategory = searchParams.get("category");
    setSelectedCategory(newCategory || "Điện thoại");
    setCurrentPage(1);
  }, [searchParams]);

  // Load sản phẩm từ API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products initially to handle filtering on client-side
        const res = await productService.getAll({ page: 1, limit: 100 });
        const allProducts = res.data || [];

        const productsWithDetails = allProducts.map((product: any) => {
          const variants = product.variants || [];
          const availableVariants = variants.filter(
            (v: any) => v.quantity > 0 && (v.isActive ?? v.active),
          );

          let lowestPrice = 0;
          if (availableVariants.length > 0) {
            lowestPrice = Math.min(
              ...availableVariants.map((v: any) => v.baseSalePrice),
            );
          } else if (variants.length > 0) {
            lowestPrice = Math.min(
              ...variants.map((v: any) => v.baseSalePrice),
            );
          }

          const colors = variants
            .filter((v: any) => v.isActive ?? v.active)
            .map((v: any) => ({
              name: v.color || "Mặc định",
              code: "#CCCCCC",
              variantId: v.optionId,
            }))
            .filter(
              (color: any, index: number, self: any[]) =>
                index === self.findIndex((c) => c.name === color.name),
            );

          return {
            ...product,
            baseSalePrice: lowestPrice,
            colors: colors,
            hasStock: availableVariants.length > 0,
          };
        });

        // Lọc theo danh mục đã chọn
        const filteredByCategory = productsWithDetails.filter((p: any) => {
          if (!selectedCategory) return true;
          return p.category?.categoryName === selectedCategory;
        });

        setProducts(filteredByCategory);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    setCurrentPage(1);
  }, [selectedCategory]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrands, priceRange, searchQuery]);

  // Filter products - THÊM SEARCH FILTER
  const filteredProducts = products.filter((product) => {
    // Filter by search query
    if (searchQuery && searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase().trim();
      const productName = product.proName.toLowerCase();
      const productDescription = product.description?.toLowerCase() || "";

      // Kiểm tra nếu search query có trong tên hoặc mô tả sản phẩm
      if (
        !productName.includes(searchLower) &&
        !productDescription.includes(searchLower)
      ) {
        return false;
      }
    }

    // Filter by brand
    if (selectedBrands.length > 0) {
      const productBrandName = product.brand?.brandName;
      if (!productBrandName || !selectedBrands.includes(productBrandName)) {
        return false;
      }
    }

    // Filter by price
    const basePrice = product.baseSalePrice || product.price;
    if (basePrice < priceRange[0] || basePrice > priceRange[1]) {
      return false;
    }

    return true;
  });

  // Tính toán số sản phẩm hiển thị (Load More logic)
  const displayedProducts = filteredProducts.slice(
    0,
    currentPage * itemsPerPage,
  );
  const hasMore = displayedProducts.length < filteredProducts.length;
  const remainingCount = filteredProducts.length - displayedProducts.length;

  // Transform product for ProductCard
  const transformProduct = (product: any, index: number) => {
    const basePrice = product.baseSalePrice || 0;

    // Tìm ảnh cover
    const coverImg =
      product.images?.find((img: any) => img.isCover) ||
      product.images?.[0] ||
      product.mainImage;
    const coverUrl =
      typeof coverImg === "string" ? coverImg : coverImg?.imageUrl;

    return {
      id: product.proId,
      name: product.proName,
      slug: product.slug,
      image: coverUrl
        ? coverUrl.startsWith("http")
          ? coverUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${coverUrl}`
        : "https://placehold.co/400x400?text=No+Image",
      originalPrice: formatPrice(basePrice),
      price: formatPrice(basePrice),
      discount: "",
      savedAmount: "",
      installment: true,
      rating: product.rating || 4.5,
      ratingCount: Math.floor(Math.random() * 1000) + 100,
      specs: [],
      colors: product.colors || [],
    };
  };

  // Function để clear search
  const clearSearch = () => {
    setSearchQuery("");
    // Cập nhật URL để xóa search parameter
    window.history.pushState({}, "", "/products");
  };

  // Function để clear tất cả filters
  const clearAllFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 64000000]);
    clearSearch();
  };

  return (
    <>
      <div className="pb-10">
        <AutoHideHeader>
          <Header />
        </AutoHideHeader>
      </div>
      <div className="min-h-screen bg-[#F3F4F6] lg:pt-20">
        <div className="border-b pl-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 overflow-x-auto">
              <Link href="/" className="text-blue-600 hover:underline">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-black">Sản phẩm</span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-black">
              {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` : "Sản phẩm"}
            </h1>
          </div>
        </div>
        <ProductSlider />
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilter(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-200 font-medium hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc tìm kiếm
            </button>
          </div>

          <div className="flex gap-6">
            {/* Desktop Sidebar Filter - Sticky */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-80 flex-shrink-0"
            >
              <div className="sticky top-6">
                <div className="bg-white rounded-2xl">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">Bộ lọc tìm kiếm</h2>
                    </div>
                  </div>
                  <FilterSidebar
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedBrands={selectedBrands}
                    setSelectedBrands={setSelectedBrands}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                  />
                </div>
              </div>
            </motion.aside>

            {/* Mobile Filter Sidebar */}
            <AnimatePresence>
              {showMobileFilter && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMobileFilter(false)}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden"
                  >
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">
                          Bộ lọc tìm kiếm
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowMobileFilter(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <FilterSidebar
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedBrands={selectedBrands}
                      setSelectedBrands={setSelectedBrands}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                    />
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                      <button
                        onClick={() => setShowMobileFilter(false)}
                        className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-700"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <main className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">Đang tải sản phẩm...</div>
                </div>
              ) : (
                <>
                  {/* Active Filters Display */}
                  {(searchQuery ||
                    selectedBrands.length > 0 ||
                    priceRange[0] !== 0 ||
                    priceRange[1] !== 64000000) && (
                    <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Tìm thấy{" "}
                          <span className="text-red-600">
                            {filteredProducts.length}
                          </span>{" "}
                          kết quả
                        </span>
                        <button
                          onClick={clearAllFilters}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {/* Search Query Display */}
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 rounded-full text-sm text-blue-800 font-medium">
                            Tìm kiếm: "{searchQuery}"
                            <button
                              onClick={clearSearch}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}

                        {/* Selected Brands */}
                        {selectedBrands.map((brand) => (
                          <span
                            key={brand}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                          >
                            {brand}
                            <button
                              onClick={() =>
                                setSelectedBrands(
                                  selectedBrands.filter((b) => b !== brand),
                                )
                              }
                              className="hover:bg-gray-200 rounded-full p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}

                        {/* Selected RAM - Removed */}

                        {/* Selected ROM - Removed */}

                        {/* Selected Battery - Removed */}

                        {/* Price Range */}
                        {(priceRange[0] !== 0 ||
                          priceRange[1] !== 64000000) && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                            {formatPrice(priceRange[0])} -{" "}
                            {formatPrice(priceRange[1])}
                            <button
                              onClick={() => setPriceRange([0, 64000000])}
                              className="hover:bg-gray-200 rounded-full p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {displayedProducts.map((product, index) => (
                      <motion.div
                        key={product.proId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: (index % itemsPerPage) * 0.05,
                        }}
                      >
                        <ProductCard
                          product={transformProduct(product, index)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-500 text-xl">✕</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Không tìm thấy sản phẩm
                      </h3>

                      <p className="text-gray-500 text-center max-w-md mb-6">
                        {searchQuery
                          ? `Không có sản phẩm nào phù hợp với từ khóa "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
                          : "Không có sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh tiêu chí tìm kiếm."}
                      </p>

                      <button
                        onClick={clearAllFilters}
                        className="px-6 py-2.5 bg-red-500 hover:bg-red-700 text-white rounded-lg 
                 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  )}

                  {/* Load More Button */}
                  {filteredProducts.length > itemsPerPage && (
                    <div className="mt-6 lg:mt-8">
                      {hasMore ? (
                        <div className="flex flex-col items-center gap-4">
                          <button
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className="px-6 py-2 rounded-full bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
                          >
                            <span>
                              Xem thêm {Math.min(itemsPerPage, remainingCount)}{" "}
                              kết quả
                            </span>
                            <ChevronDown className="w-5 h-5" />
                          </button>
                          <div className="text-xs lg:text-sm text-gray-600">
                            Hiển thị {displayedProducts.length} trong số{" "}
                            {filteredProducts.length} sản phẩm
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-3">
                            Đã hiển thị tất cả {filteredProducts.length} sản
                            phẩm
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <ProductPageContent />
    </Suspense>
  );
}
