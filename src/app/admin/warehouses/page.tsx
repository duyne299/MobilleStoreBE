"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    PackagePlus,
    Package,
    LogIn,
    ArrowDownToLine,
} from "lucide-react";
import Link from "next/link";
import { useWarehouses } from "@/hooks/useWarehouse";
import Toast from "@/components/ui/Toast";
import ImportModal from "@/components/warehouses/ImportModal";

export default function WarehouseManagement() {
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

    const {
        items: warehouses,
        loading,
        error,
        currentPage,
        total,
        limit,
        searchItems: searchWarehouses,
        nextPage,
    } = useWarehouses(10);

    const totalPages = Math.ceil(total / limit);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchWarehouses(value);
    };

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 10000);
    };

    const handleImportClick = (warehouse?: any) => {
        setSelectedWarehouse(warehouse || null);
        setIsModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const generatePages = (totalPages: number, currentPage: number): (number | "...")[] => {
        const pages: (number | "...")[] = [];
        const delta = 1;
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }

        return pages;
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
                            Quản lý kho hàng
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý kho hàng
                    </h1>
                </motion.header>

                {/* ACTIONS */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        onClick={() => handleImportClick()}
                    >
                        <PackagePlus className="w-5 h-5" />
                        Nhập kho
                    </motion.button>

                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm trong kho"
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
                            <div className="p-4 text-center text-gray-500">Đang tải dữ liệu kho...</div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">{error}</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">STT</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Biến thể (rom - màu)</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Cửa hàng</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Giá nhập</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Giá bán</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Số lượng</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Ngày nhập</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {warehouses.map((item, idx) => (
                                        <motion.tr
                                            key={item.warehouseId}
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

                                            {/* Sản phẩm */}
                                            <td className="px-4 py-4 min-w-[150px] max-w-[190px] relative group">
                                                <span className="text-sm font-medium text-gray-900 block truncate">
                                                    {item.option.product.proName}
                                                </span>
                                                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-max max-w-xs hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                                                    {item.option.product.proName}
                                                </div>
                                            </td>

                                            {/* Tùy chọn */}
                                            <td className="px-4 py-4 text-sm text-gray-600 min-w-[150px] max-w-[150px] relative group">
                                                {item.option.rom + " - " + item.option.color || "Mặc định"}
                                                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-max max-w-xs hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                                                    {item.option.rom + " - " + item.option.color || "Mặc định"}
                                                </div>
                                            </td>

                                            {/* Cửa hàng */}
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {item.store.storeName}
                                            </td>

                                            {/* Giá nhập */}
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {formatCurrency(item.importPrice)}
                                                </span>
                                            </td>

                                            {/* Giá bán */}
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-blue-600 font-medium">
                                                    {formatCurrency(item.baseSalePrice)}
                                                </span>
                                            </td>

                                            {/* Số lượng */}
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.quantity > 50
                                                        ? "bg-green-100 text-green-700"
                                                        : item.quantity > 10
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {item.quantity}
                                                </span>
                                            </td>

                                            {/* Ngày nhập */}
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                                    {new Date(item.lastImportDate).toLocaleDateString("vi-VN")}
                                                </span>
                                            </td>

                                            {/* Thao tác */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        onClick={() => handleImportClick(item)}
                                                        title="Nhập thêm"
                                                    >
                                                        <ArrowDownToLine className="w-4 h-4" />
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
                        {generatePages(totalPages, currentPage).map((p, index) => (
                            <React.Fragment key={index}>
                                {p === "..." ? (
                                    <span className="px-2">...</span>
                                ) : (
                                    <motion.button
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
                                )}
                            </React.Fragment>
                        ))}

                        {/* Next */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => nextPage(Math.min(totalPages, currentPage + 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

            </div>

            <ImportModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedWarehouse(null);
                }}
                setToast={(toast) => showToast(toast.type, toast.message)}
                warehouse={selectedWarehouse}
                onSuccess={() => {
                    searchWarehouses(searchTerm);
                }}
            />

            <Toast toast={toast} />
        </div>
    );
}