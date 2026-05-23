"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProducts } from "@/hooks/useProduct";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmToast from "@/components/ui/ConfirmToast";
import Toast from "@/components/ui/Toast";

export default function ProductManagement() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    proId?: number;
    proName?: string;
  }>({ show: false });
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const {
    products,
    loading,
    error,
    currentPage,
    total,
    limit,
    searchProducts,
    nextPage,
    deleteProduct,
    changeProductStatus,
  } = useProducts(10);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);
    searchProducts(keyword); // hook sẽ tự reset page = 1
  };

  const handleDeleteClick = (proId: number, proName: string) => {
    setConfirmDelete({ show: true, proId, proName });
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 10000); // 3 giây tự ẩn
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.proId) return;
    try {
      await deleteProduct(confirmDelete.proId);
      showToast("success", `Xóa sản phẩm thành công!`);

      // Reload lại danh sách sản phẩm
      searchProducts(searchTerm); // nếu đang search theo từ khóa
      // hoặc nextPage(currentPage); // nếu muốn giữ nguyên page
    } catch (err: any) {
      showToast(
        "error",
        err.message || `Xóa sản phẩm "${confirmDelete.proName}" thất bại!`,
      );
    } finally {
      setConfirmDelete({ show: false });
    }
  };

  const handleCancelDelete = () => setConfirmDelete({ show: false });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Link
              href={"/admin"}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Sản phẩm mới
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Quản lý sản phẩm
          </h1>
        </motion.header>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <motion.button
              suppressHydrationWarning
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={() => router.push("/admin/products/add")}
            >
              <Plus className="w-5 h-5" />
              Thêm mới
            </motion.button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Đang tải sản phẩm...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      STT
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Hình ảnh
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Tên sản phẩm
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Thương hiệu
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Danh mục
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap ">
                      Tồn kho
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Đã bán
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Đánh giá TB
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Trạng thái
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product, idx) => (
                    <motion.tr
                      key={product.proId || product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: "#F9FAFB" }}
                      className="transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {(currentPage - 1) * limit + idx + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          {(() => {
                            let coverImage = product.mainImage;
                            if (
                              !coverImage &&
                              product.images &&
                              product.images.length > 0
                            ) {
                              const firstImg = product.images[0];
                              coverImage =
                                typeof firstImg === "string"
                                  ? firstImg
                                  : firstImg.imageUrl;
                            }
                            if (coverImage) {
                              const src = coverImage.startsWith("http")
                                ? coverImage
                                : `${process.env.NEXT_PUBLIC_API_URL}${coverImage}`;
                              return (
                                <img
                                  src={src}
                                  alt={product.proName}
                                  className="w-full h-full object-cover"
                                />
                              );
                            }
                            return (
                              <span className="w-full h-full flex items-center justify-center text-gray-400">
                                📦
                              </span>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[150px] relative group">
                        <span className="text-sm font-medium text-gray-900 line-clamp-1 cursor-pointer">
                          {product.proName}
                        </span>
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-max max-w-xs hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          {product.proName}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {product.brand?.brandName || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {product.category?.categoryName || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-gray-900">
                          {product.totalQuantity}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-gray-900">
                          {product.soldQuantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-1 ">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {product.rating}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-4 text-center cursor-pointer"
                        onDoubleClick={async () => {
                          try {
                            // gọi hook để đổi trạng thái
                            await changeProductStatus(
                              product.proId,
                              !product.isActive,
                            );
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-700 whitespace-nowrap"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.isActive ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            suppressHydrationWarning
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() =>
                              router.push(
                                `/admin/products/edit/${product.slug}`,
                              )
                            }
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() =>
                              handleDeleteClick(product.proId, product.proName)
                            }
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Pagination - ra ngoài div bo góc */}
        <div className="mt-4 px-4 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Hiển thị {(currentPage - 1) * limit + 1} đến{" "}
            {Math.min(currentPage * limit, total)} của {total} kết quả
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              suppressHydrationWarning
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => nextPage(Math.max(currentPage - 1, 1))}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                suppressHydrationWarning
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nextPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {page}
              </motion.button>
            ))}

            <motion.button
              suppressHydrationWarning
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => nextPage(Math.min(currentPage + 1, totalPages))}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      <ConfirmToast
        show={confirmDelete.show}
        message={`Bạn có chắc chắn muốn xóa "${confirmDelete.proName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <Toast toast={toast} />
    </div>
  );
}
