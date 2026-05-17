"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategory";
import { usePosts } from "@/hooks/usePost";
import Toast from "@/components/ui/Toast";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export default function AddPostPage() {
  const router = useRouter();
  const {
    categories: allCategories,
    loading: loadingCat,
    error: errorCat,
  } = useCategories(100);
  const { createPost, loading: saving } = usePosts();

  const [formData, setFormData] = useState({
    title: "",
    categoryId: 0,
    categoryName: "",
    excerpt: "",
    content: "",
    isVisible: true,
    thumbnail: null as File | null,
    authorId: 0,
  });

  const [preview, setPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Lấy authorId từ token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.userId)
        setFormData((prev) => ({ ...prev, authorId: decoded.userId }));
      else if (decoded && decoded.id)
        setFormData((prev) => ({ ...prev, authorId: decoded.id }));
      else if (decoded && decoded.sub)
        setFormData((prev) => ({ ...prev, authorId: parseInt(decoded.sub) }));
    }
  }, []);

  const postCategories = allCategories.filter((cat) => {
    const parentCategory = allCategories.find(
      (c) => c.categoryName === "Bài viết",
    );
    return cat.parentId === parentCategory?.categoryId;
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Generic handleChange cho input, checkbox
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnail: null }));
    setPreview("");
  };

  const handleSave = async () => {
    if (saving) return;

    if (!formData.title.trim())
      return showToast("error", "Vui lòng nhập tiêu đề");
    if (!formData.categoryId || formData.categoryId === 0)
      return showToast("error", "Vui lòng chọn danh mục");
    if (!formData.content.trim())
      return showToast("error", "Vui lòng nhập nội dung");
    // if (!formData.authorId) return showToast("error", "Không tìm thấy thông tin tác giả");

    try {
      // Gửi đúng dữ liệu service mong đợi
      const postPayload = {
        title: formData.title.trim(),
        slug: "", // Backend tự generate
        content: formData.content,
        excerpt: formData.excerpt.trim() || null,
        isActive: formData.isVisible,
        categoryId: formData.categoryId,
        ...(formData.authorId > 0 && { authorId: formData.authorId }),
      };

      await createPost(postPayload, formData.thumbnail || undefined);
      showToast("success", "Thêm bài viết thành công");
      setTimeout(() => router.push("/admin/posts"), 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đã xảy ra lỗi khi lưu bài viết";
      showToast("error", msg);
    }
  };

  const handleCancel = () => router.push("/admin/posts");

  return (
    <div className="min-h-screen bg-gray-50 p-6" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Link
              href={"/admin"}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              Trang chủ
            </Link>
            <span>/</span>
            <Link
              href={"/admin/posts"}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              Bài viết
            </Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Thêm bài viết mới
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Thêm bài viết mới
          </h1>
        </motion.header>

        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8 space-y-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Tương lai của thương mại điện tử"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: parseInt(e.target.value),
                  }))
                }
                disabled={loadingCat}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value={0}>
                  {loadingCat ? "Đang tải..." : "--Chọn danh mục--"}
                </option>
                {!loadingCat &&
                  !errorCat &&
                  postCategories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
              </select>
              {errorCat && (
                <p className="text-sm text-red-500 mt-1">{errorCat}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả ngắn
              </label>
              <input
                type="text"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Ví dụ: Tóm tắt nội dung bài viết"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* Ảnh bìa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh bìa
              </label>
              <div
                onClick={() =>
                  document.getElementById("thumbnail-upload")?.click()
                }
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative w-full h-64 flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer duration-200 hover:scale-[1.01] ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
              >
                {preview ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={preview}
                      alt="Xem trước ảnh bìa"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeThumbnail();
                      }}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span className="text-white text-sm font-medium">
                          Xóa ảnh
                        </span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.9A5 5 0 1116 6a5 5 0 011 9.9M15 13l-3-3-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">
                      Kéo thả file hoặc{" "}
                      <span className="text-blue-600 font-semibold underline">
                        chọn file
                      </span>
                    </p>
                  </>
                )}
              </div>
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Nội dung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung
              </label>
              <div className="rounded-xl border border-gray-300 bg-gray-50 overflow-hidden">
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, content: value }))
                  }
                  height={900}
                />
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">
                {formData.isVisible ? "Hiển thị" : "Ẩn"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <motion.button
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {saving ? "Đang lưu..." : "Lưu bài viết"}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
