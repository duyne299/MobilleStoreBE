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
    Eye,
} from "lucide-react";
import Link from "next/link";
import { usePosts } from "@/hooks/usePost";
import Toast from "@/components/ui/Toast";
import ConfirmToast from "@/components/ui/ConfirmToast";
import Image from "next/image";
import { useRouter } from "next/dist/client/components/navigation";
import { useCategories } from "@/hooks/useCategory";

export default function PostManagement() {
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        postId?: number;
        postTitle?: string;
    }>({ show: false });

    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
    const {
        posts,
        loading,
        error,
        currentPage,
        total,
        limit,
        searchPosts,
        nextPage,
        deletePost,
        updatePostStatus,
    } = usePosts(10);
    const { categories } = useCategories(100);
    const categoryMap: Record<number, string> = {};
    categories.forEach(cat => {
        categoryMap[cat.categoryId] = cat.categoryName;
    });
    const totalPages = Math.ceil(total / limit);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchPosts(value);
    };

    const handleDeleteClick = (postId: number, postTitle: string) => {
        setConfirmDelete({ show: true, postId, postTitle });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.postId) return;

        try {
            await deletePost(confirmDelete.postId);
            showToast(
                "success",
                `Xóa bài viết "${confirmDelete.postTitle}" thành công!`
            );
            searchPosts(searchTerm);
        } catch (err: any) {
            showToast(
                "error",
                err.message || `Xóa bài viết "${confirmDelete.postTitle}" thất bại!`
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

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return "—";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
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
                            Bài viết
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý bài viết
                    </h1>
                </motion.header>

                {/* ACTIONS */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <Link href="/admin/posts/add">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm bài viết
                        </motion.button>
                    </Link>

                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề bài viết"
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
                            <div className="p-4 text-center text-gray-500">Đang tải bài viết...</div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">{error}</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">STT</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Hình ảnh</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Tiêu đề</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Tác giả</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Danh mục</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Trạng thái</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Ngày tạo</th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {posts.map((post, idx) => (
                                        <motion.tr
                                            key={post.postId}
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
                                                {post.thumbnail ? (
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}${post.thumbnail}`}
                                                            alt={post.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <Eye className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>

                                            {/* Tiêu đề */}
                                            <td className="px-4 py-4 min-w-[250px]">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {truncateText(post.title, 60)}
                                                </span>
                                            </td>

                                            {/* Tác giả */}
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {post.author.authorName || "Unknown"}
                                            </td>

                                            {/* Danh mục */}
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {post.categoryId ? categoryMap[post.categoryId] || "—" : "—"}
                                                </span>
                                            </td>

                                            {/* Trạng thái */}
                                            <td
                                                className="px-4 py-4 text-center cursor-pointer"
                                                onDoubleClick={() =>
                                                    updatePostStatus(post.postId, !post.isActive)
                                                }
                                            >
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${post.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {post.isActive ? "Hiển thị" : "Ẩn"}
                                                </span>
                                            </td>

                                            {/* Ngày tạo */}
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                                </span>
                                            </td>

                                            {/* Thao tác */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        suppressHydrationWarning
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        onClick={() => router.push(`/admin/posts/update/${post.slug}`)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </motion.button>

                                                    <motion.button
                                                        onClick={() =>
                                                            handleDeleteClick(post.postId, post.title)
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
                            disabled={currentPage === 1}
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>

            <ConfirmToast
                show={confirmDelete.show}
                message={`Bạn có chắc muốn xóa bài viết "${confirmDelete.postTitle}" không?`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <Toast toast={toast} />
        </div>
    );
}