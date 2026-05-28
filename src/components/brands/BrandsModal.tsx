"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBrands } from "@/hooks/useBrand";
import { Upload, X } from "lucide-react";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  setToast: (toast: { message: string; type: "success" | "error" }) => void;
  onSuccess?: (brand: any) => void;
  brand?: any; // thương hiệu đang sửa
}

export default function BrandModal({
  isOpen,
  onClose,
  setToast,
  onSuccess,
  brand,
}: BrandModalProps) {
  const { createBrand, updateBrand } = useBrands();

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    isVisible: true,
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Khi brand thay đổi (chọn sửa), điền dữ liệu vào form
  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.brandName,
        logo: brand.brandLogo || "",
        isVisible: brand.isActive ?? true,
      });
      setLogoPreview(brand.brandLogo || "");
    } else {
      setFormData({
        name: "",
        logo: "",
        isVisible: true,
      });
      setLogoPreview("");
    }
    setLogoFile(null);
  }, [brand]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        setToast({ message: "Vui lòng chọn file ảnh!", type: "error" });
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          message: "Kích thước ảnh không được vượt quá 5MB!",
          type: "error",
        });
        return;
      }

      setLogoFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setFormData((prev) => ({ ...prev, logo: "" }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setToast({ message: "Vui lòng nhập tên thương hiệu!", type: "error" });
      return;
    }

    const payload = {
      brandName: formData.name,
      brandLogo: logoFile || formData.logo || undefined,
      isActive: formData.isVisible,
    };

    try {
      if (brand) {
        // Update
        await updateBrand(brand.brandId, payload, logoFile ?? undefined);
        setToast({
          message: "Cập nhật thương hiệu thành công!",
          type: "success",
        });
      } else {
        // Create
        await createBrand(payload, logoFile ?? undefined);
        setToast({ message: "Thêm thương hiệu thành công!", type: "success" });
      }

      // Reset form
      setFormData({
        name: "",
        logo: "",
        isVisible: true,
      });
      setLogoPreview("");
      setLogoFile(null);

      if (onSuccess) onSuccess(payload); // reload bảng

      onClose();
    } catch (err: any) {
      let message = "Không thể lưu thương hiệu";

      // Kiểm tra nếu là AxiosError có response
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }

      setToast({ message: `${message}`, type: "error" });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl pointer-events-auto">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {brand ? "Sửa Thương Hiệu" : "Thêm Thương Hiệu Mới"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tên Thương Hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Apple, Samsung, Dell..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Logo Thương Hiệu
                  </label>

                  {/* Preview Logo */}
                  {logoPreview && (
                    <div className="mb-3 relative inline-block">
                      <img
                        src={
                          logoPreview.startsWith("data:") ||
                          logoPreview.startsWith("http")
                            ? logoPreview
                            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${logoPreview}`
                        }
                        alt="Logo preview"
                        className="w-32 h-32 object-contain rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {logoPreview ? "Thay đổi logo" : "Tải lên logo"}
                      </span>
                      <span className="text-xs text-slate-500">
                        PNG, JPG, GIF (max 5MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Trạng Thái
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        name="isVisible"
                        checked={formData.isVisible}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:border-slate-600 dark:bg-slate-700 dark:peer-focus:ring-green-800"></div>
                    </label>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Hiển thị
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
                  >
                    {brand ? "Lưu thay đổi" : "Thêm thương hiệu"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
