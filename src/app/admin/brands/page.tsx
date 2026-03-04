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
} from "lucide-react";
import Link from "next/link";
import { useBrands } from "@/hooks/useBrand";
import Toast from "@/components/ui/Toast";
import BrandModal from "@/components/brands/BrandsModal";
import ConfirmToast from "@/components/ui/ConfirmToast";

export default function BrandManagement() {
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        brandId?: number;
        brandName?: string;
    }>({ show: false });

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<any>(null);

    const {
        brands,
        loading,
        error,
        currentPage,
        total,
        limit,
        searchBrands,
        nextPage,
        deleteBrand,
        updateBrandStatus,
    } = useBrands(10);

    const totalPages = Math.ceil(total / limit);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchBrands(value);
    };

    const handleDeleteClick = (brandId: number, brandName: string) => {
        setConfirmDelete({ show: true, brandId, brandName });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.brandId) return;

        try {
            await deleteBrand(confirmDelete.brandId);
            showToast(
                "success",
                `Xóa thương hiệu "${confirmDelete.brandName}" thành công!`
            );
            searchBrands(searchTerm);
        } catch (err: any) {
            showToast(
                "error",
                err.message || `Xóa thương hiệu "${confirmDelete.brandName}" thất bại!`
            );
        } finally {
            setConfirmDelete({ show: false });
        }
    };

    const handleCancelDelete = () => setConfirmDelete({ show: false });

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2000);
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
                            href={"/admin"}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span className="font-medium text-gray-800">
                            Thương hiệu
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý thương hiệu
                    </h1>
                </motion.header>

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
                            placeholder="Tìm kiếm theo tên thương hiệu"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* TABLE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Đang tải thương hiệu...</div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">{error}</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">STT</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Logo</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Tên thương hiệu</th>
                                        <th className="px-4 py-4 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">
                                            Trạng thái
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Ngày tạo</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {brands.map((brand, idx) => (
                                        <motion.tr
                                            key={brand.brandId}
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

                                            {/* Logo */}
                                            <td className="px-4 py-4">
                                                {brand.brandLogo ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${brand.brandLogo}`}
                                                        alt={brand.brandName}
                                                        className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">No Logo</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Tên thương hiệu */}
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {brand.brandName}
                                                </span>
                                            </td>

                                            {/* Trạng thái */}
                                            <td
                                                className="px-4 py-4 text-center cursor-pointer"
                                                onDoubleClick={() => updateBrandStatus(brand.slug, !brand.isActive)}
                                            >
                                                <span
                                                    className={`inline-flex justify-center items-center px-3 py-1 rounded-full text-xs font-medium ${brand.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {brand.isActive ? "Hiển thị" : "Ẩn"}
                                                </span>
                                            </td>


                                            {/* Ngày tạo */}
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                                    {new Date(brand.createdAt).toLocaleDateString("vi-VN")}
                                                </span>
                                            </td>

                                            {/* Thao tác */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        onClick={() => {
                                                            setEditingBrand(brand);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </motion.button>

                                                    <motion.button
                                                        onClick={() =>
                                                            handleDeleteClick(brand.brandId, brand.brandName)
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

                {/* PAGINATION */}
                <div className="mt-4 flex items-center justify-between px-4 py-4">
                    <span className="text-sm text-gray-600">
                        Hiển thị {(currentPage - 1) * limit + 1} đến {Math.min(currentPage * limit, total)} của {total} kết quả
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Prev */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => nextPage(Math.max(1, currentPage - 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={currentPage === 1}
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
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>

            <BrandModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBrand(null);
                }}
                setToast={(toast) => showToast(toast.type, toast.message)}
                brand={editingBrand}
                onSuccess={(updatedBrand) => {
                    searchBrands(searchTerm);
                }}
            />

            <ConfirmToast
                show={confirmDelete.show}
                message={`Bạn có chắc muốn xóa thương hiệu "${confirmDelete.brandName}" không?`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <Toast toast={toast} />
        </div>
    );
}