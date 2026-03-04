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
    MapPin,
} from "lucide-react";
import Link from "next/link";
import { useStores } from "@/hooks/useStore";
import Toast from "@/components/ui/Toast";
import ConfirmToast from "@/components/ui/ConfirmToast";
import StoreModal from "@/components/stores/StoresModal";

export default function StoreManagement() {
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        storeId?: number;
        storeName?: string;
    }>({ show: false });

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<any>(null);

    const {
        stores,
        loading,
        error,
        currentPage,
        total,
        limit,
        searchStores,
        nextPage,
        deleteStore,
        updateStoreStatus,
    } = useStores(10);

    const totalPages = Math.ceil(total / limit);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchStores(value);
    };

    const handleDeleteClick = (storeId: number, storeName: string) => {
        setConfirmDelete({ show: true, storeId, storeName });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.storeId) return;

        try {
            await deleteStore(confirmDelete.storeId);
            showToast(
                "success",
                `Xóa cửa hàng "${confirmDelete.storeName}" thành công!`
            );
            searchStores(searchTerm);
        } catch (err: any) {
            showToast(
                "error",
                err.message || `Xóa cửa hàng "${confirmDelete.storeName}" thất bại!`
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
                            Quản lý cửa hàng
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý cửa hàng
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
                        Thêm cửa hàng
                    </motion.button>

                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc địa chỉ"
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
                            <div className="p-4 text-center text-gray-500">Đang tải danh sách cửa hàng...</div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">{error}</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">STT</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Tên cửa hàng</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Địa chỉ</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Tọa độ</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Trạng thái</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {stores.map((store, idx) => (
                                        <motion.tr
                                            key={store.storeId}
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

                                            {/* Tên cửa hàng */}
                                            <td className="px-4 py-4 min-w-[180px]">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {store.storeName}
                                                </span>
                                            </td>

                                            {/* Địa chỉ */}
                                            <td className="px-4 py-4 min-w-[250px]">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600">
                                                        {store.address || "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Tọa độ */}
                                            <td className="px-4 py-4">
                                                {store.latitude && store.longitude ? (
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <div>Lat: {store.latitude.toFixed(4)}</div>
                                                        <div>Lng: {store.longitude.toFixed(4)}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Trạng thái */}
                                            <td
                                                className="px-4 py-4 cursor-pointer"
                                                onDoubleClick={() => updateStoreStatus(store.storeId)}
                                                title="Double click để thay đổi trạng thái"
                                            >
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${store.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {store.isActive ? "Hoạt động" : "Ngừng"}
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
                                                            setEditingStore(store);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() =>
                                                            handleDeleteClick(store.storeId, store.storeName)
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
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>

            <StoreModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingStore(null);
                }}
                setToast={(toast: any) => showToast(toast.type, toast.message)}
                store={editingStore}
                onSuccess={() => {
                    searchStores(searchTerm);
                }}
            />

            <ConfirmToast
                show={confirmDelete.show}
                message={`Bạn có chắc muốn xóa cửa hàng "${confirmDelete.storeName}" không?`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <Toast toast={toast} />
        </div>
    );
}