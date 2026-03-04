"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image,
  Link2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import ConfirmToast from "@/components/ui/ConfirmToast";
import { useBanners } from "@/hooks/useBanner";
import BannerModal from "@/components/banners/BannerModal";

export default function BannerManagement() {
  const {
    banners,
    loading,
    error,
    currentPage,
    total,
    limit,
    searchBanners,
    nextPage,
    deleteBanner,
    updateBannerStatus,
  } = useBanners(10);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    bannerId?: number;
    bannerTitle?: string;
  }>({ show: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchBanners(value);
  };

  const handleDeleteClick = (bannerId: number, bannerTitle: string) => {
    setConfirmDelete({ show: true, bannerId, bannerTitle });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.bannerId) return;
    try {
      await deleteBanner(confirmDelete.bannerId);
      showToast("success", `Xóa banner "${confirmDelete.bannerTitle}" thành công!`);
      setConfirmDelete({ show: false });
    } catch (err) {
      showToast("error", "Xóa banner thất bại!");
    }
  };

  const handleCancelDelete = () => setConfirmDelete({ show: false });

  const handleUpdateStatus = async (bannerId: number, isActive: boolean) => {
    try {
      await updateBannerStatus(bannerId, isActive);
      showToast("success", `Cập nhật trạng thái thành công!`);
    } catch (err) {
      showToast("error", "Cập nhật trạng thái thất bại!");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex gap-2 text-sm text-gray-500 mb-3">
            <Link
              href="/admin"
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-800">
              Banner
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Banner
          </h1>
        </motion.header>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            Thêm mới
          </motion.button>
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* TABLE */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      STT
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Hình ảnh
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Mô tả ngắn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Link
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Thời gian
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Vị trí
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Trạng thái
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {banners.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        Không có banner nào
                      </td>
                    </tr>
                  ) : (
                    banners.map((banner: any, idx: any) => (
                      <motion.tr
                        key={banner.bannerId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ backgroundColor: "#F9FAFB" }}
                        className="transition-colors"
                      >
                        {/* STT */}
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {(currentPage - 1) * limit + idx + 1}
                        </td>

                        {/* Hình ảnh */}
                        <td className="px-4 py-4">
                          <div className="w-24 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {banner.imageUrl ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${banner.imageUrl}`}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Image className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </td>

                        {/* Tiêu đề */}
                        <td className="px-4 py-4 max-w-[150px] relative group">
                          <span className="text-sm font-medium text-gray-900 line-clamp-2">
                            {banner.title || "—"}
                          </span>
                          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-max max-w-xs hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            {banner.title}
                          </div>
                        </td>

                        <td className="px-4 py-4 max-w-[200px]  relative group">
                          <span className="text-sm text-gray-600 line-clamp-2 truncate">
                            {banner.excerpt || "—"}
                          </span>
                          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-max max-w-xs hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                            {banner.excerpt}
                          </div>
                        </td>
                        {/* Link */}
                        <td className="px-4 py-4 max-w-[150px] relative group">
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span
                              className="text-sm text-blue-600 truncate"
                            >
                              {banner.linkTarget || "—"}
                            </span>
                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-max max-w-xs hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              {banner.linkTarget}
                            </div>
                          </div>
                        </td>

                        {/* Thời gian */}
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-1 text-xs text-gray-600">
                            <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <div className="whitespace-nowrap">
                              <div>{formatDate(banner.startDate)}</div>
                              <div>→ {formatDate(banner.endDate)}</div>
                            </div>
                          </div>
                        </td>

                        {/* Thứ tự */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            {banner.position || "—"}
                          </span>
                        </td>
                        {/* Trạng thái */}
                        <td
                          className="px-4 py-4 text-center cursor-pointer"
                          onDoubleClick={() =>
                            handleUpdateStatus(
                              banner.bannerId,
                              !banner.isActive
                            )
                          }
                        >
                          {isExpired(banner.endDate) ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Hết hạn
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${banner.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {banner.isActive ? "Hoạt động" : "Tạm dừng"}
                            </span>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => {
                                setEditingBanner(banner);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleDeleteClick(
                                  banner.bannerId,
                                  banner.title
                                )
                              }
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* PAGINATION */}
        {!loading && banners.length > 0 && (
          <div className="mt-4 flex items-center justify-between px-4 py-4">
            <span className="text-sm text-gray-600">
              Hiển thị {(currentPage - 1) * limit + 1} đến{" "}
              {Math.min(currentPage * limit, total)} của {total} kết quả
            </span>
            <div className="flex items-center gap-2">
              {/* Prev */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nextPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => nextPage(p)}
                  className={`w-10 h-10 rounded-lg ${p === currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {p}
                </motion.button>
              ))}

              {/* Next */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  nextPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <BannerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBanner(null);
        }}
        setToast={(toast: any) => showToast(toast.type, toast.message)}
        banner={editingBanner}
        onSuccess={() => {
          searchBanners(searchTerm);
        }}
      />

      <ConfirmToast
        show={confirmDelete.show}
        message={`Bạn có chắc muốn xóa banner "${confirmDelete.bannerTitle}" không?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* TOAST */}
      <Toast toast={toast} />
    </div>
  );
}