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
    Mail,
    Phone,
    MapPin,
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import ConfirmToast from "@/components/ui/ConfirmToast";
import { useUsers } from "@/hooks/useUser";
import UserModal from "@/components/users/UsersModal";

export default function UserManagement() {
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        userId?: number;
        userName?: string;
    }>({ show: false });

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const {
        users,
        loading,
        error,
        currentPage,
        total,
        limit,
        searchUsers,
        nextPage,
        deleteUser,
        updateUserStatus,
    } = useUsers(10);

    const totalPages = Math.ceil(total / limit);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchUsers(value);
    };

    const handleDeleteClick = (userId: number, userName: string) => {
        setConfirmDelete({ show: true, userId, userName });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.userId) return;

        try {
            await deleteUser(confirmDelete.userId);
            showToast(
                "success",
                `Xóa người dùng "${confirmDelete.userName}" thành công!`
            );
            searchUsers(searchTerm);
        } catch (err: any) {
            showToast(
                "error",
                err.message || `Xóa người dùng "${confirmDelete.userName}" thất bại!`
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

    const getRoleBadge = (role: string) => {
        const roleStyles: Record<string, string> = {
            admin: "bg-purple-100 text-purple-700",
            user: "bg-blue-100 text-blue-700",
            staff: "bg-orange-100 text-orange-700",
        };
        return roleStyles[role.toLowerCase()] || "bg-gray-100 text-gray-700";
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
                            Người dùng
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý người dùng
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
                        Thêm người dùng
                    </motion.button>

                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại"
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
                            <div className="p-8 text-center text-gray-500">
                                Đang tải danh sách người dùng...
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-500">{error}</div>
                        ) : users.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Không tìm thấy người dùng nào
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                                            STT
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                                            Người dùng
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                                            Thông tin liên hệ
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                                            Địa chỉ
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                                            Vai trò
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
                                    {users.map((user: any, idx: any) => (
                                        <motion.tr
                                            key={user.userId}
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

                                            {/* Người dùng (Avatar + Tên) */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                                                        {user.avatar ? (
                                                            <img
                                                                src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                                                                alt={user.fullName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm">
                                                                {user.fullName?.charAt(0).toUpperCase() || "U"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user.fullName || "—"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ID: {user.userId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Thông tin liên hệ */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate max-w-[200px]">
                                                            {user.email || "—"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span>{user.phone || "—"}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Địa chỉ */}
                                            <td className="px-4 py-4 max-w-[200px]">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600 line-clamp-2">
                                                        {user.address || "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Vai trò */}
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(
                                                        user.role || "user"
                                                    )}`}
                                                >
                                                    {user.role || "User"}
                                                </span>
                                            </td>

                                            {/* Trạng thái */}
                                            <td
                                                className="px-4 py-4 cursor-pointer"
                                                onDoubleClick={() =>
                                                    updateUserStatus(user.userId, !user.status)
                                                }
                                            >
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.status
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {user.status ? "Hoạt động" : "Bị khóa"}
                                                </span>
                                            </td>

                                            {/* Ngày tạo */}
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                                    {new Date(user.createdAt).toLocaleDateString(
                                                        "vi-VN"
                                                    )}
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
                                                            setEditingUser(user);
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
                                                                user.userId,
                                                                user.fullName || `User ${user.userId}`
                                                            )
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
                {!loading && !error && users.length > 0 && (
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
                                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </motion.button>

                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (p) => (
                                    <motion.button
                                        key={p}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => nextPage(p)}
                                        className={`w-10 h-10 rounded-lg ${
                                            p === currentPage
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {p}
                                    </motion.button>
                                )
                            )}

                            {/* Next */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                    nextPage(Math.min(totalPages, currentPage + 1))
                                }
                                disabled={currentPage === totalPages}
                                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                setToast={(toast) => showToast(toast.type, toast.message)}
                user={editingUser}
                onSuccess={() => {
                    searchUsers(searchTerm);
                }}
            />

            {/* CONFIRM DELETE */}
            <ConfirmToast
                show={confirmDelete.show}
                message={`Bạn có chắc muốn xóa người dùng "${confirmDelete.userName}" không?`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            {/* TOAST */}
            <Toast toast={toast} />
        </div>
    );
}