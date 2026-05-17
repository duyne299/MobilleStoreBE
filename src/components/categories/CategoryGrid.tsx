"use client";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/useCategory";
import { useRouter } from "next/navigation";

export default function CategoryGrid() {
  const { categories, loading } = useCategories(10);
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
      <div className="border-white rounded-2xl p-4 sm:p-6 bg-white">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Danh mục nổi bật
        </h2>

        {/* Mobile: Horizontal scroll */}
        {loading ? (
          <div className="grid grid-cols-4 gap-3 pb-2 md:hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2" />
                <div className="w-12 h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-4 gap-3 pb-2 md:hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.slice(0, 4).map((category) => (
              <motion.div
                key={category.categoryId}
                className="flex flex-col items-center cursor-pointer group w-full"
                variants={itemVariants}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  router.push(
                    `/product?category=${encodeURIComponent(category.categoryName)}`,
                  )
                }
              >
                <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg border border-gray-200 group-active:border-blue-400 transition-colors duration-300">
                  <img
                    src={
                      category.categoryImage
                        ? category.categoryImage.startsWith("http")
                          ? category.categoryImage
                          : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${category.categoryImage}`
                        : "https://placehold.co/100x100?text=Category"
                    }
                    alt={category.categoryName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-xs font-medium text-gray-800 line-clamp-2 px-1">
                  {category.categoryName}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Desktop: Grid layout */}
        {loading ? (
          <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="animate-pulse flex flex-col items-center">
                <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-lg mb-2" />
                <div className="w-20 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="hidden md:grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category) => (
              <motion.div
                key={category.categoryId}
                className="flex flex-col items-center cursor-pointer group"
                variants={itemVariants}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  router.push(
                    `/product?category=${encodeURIComponent(category.categoryName)}`,
                  )
                }
              >
                <div className="w-24 h-24 lg:w-28 lg:h-28 aspect-square mb-2 overflow-hidden rounded-lg border border-gray-200 group-hover:border-blue-400 transition-colors duration-300">
                  <motion.img
                    src={
                      category.categoryImage
                        ? category.categoryImage.startsWith("http")
                          ? category.categoryImage
                          : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${category.categoryImage}`
                        : "https://placehold.co/100x100?text=Category"
                    }
                    alt={category.categoryName}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-center text-sm font-medium text-gray-800 line-clamp-2 px-1">
                  {category.categoryName}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
        {!loading && categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có danh mục nào để hiển thị.
          </div>
        )}
      </div>
    </div>
  );
}
