"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Percent, DollarSign, Calendar } from "lucide-react";
import { discountService } from "../../services/discountService";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  setToast: (toast: { message: string; type: "success" | "error" }) => void;
  onSuccess?: (discount: any) => void;
  discount?: any;
}

export default function DiscountModal({
  isOpen,
  onClose,
  setToast,
  onSuccess,
  discount,
}: DiscountModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENT",
    value: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    minOrderValue: "",
    isActive: true,
  });

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code || "",
        description: discount.description || "",
        discountType: discount.discountType || "PERCENT",
        value: discount.value?.toString() || "",
        startDate: discount.startDate ? discount.startDate.split("T")[0] : "",
        endDate: discount.endDate ? discount.endDate.split("T")[0] : "",
        usageLimit: discount.usageLimit?.toString() || "",
        minOrderValue: discount.minOrderValue?.toString() || "",
        isActive: discount.isActive ?? true,
      });
    } else {
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENT",
        value: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        minOrderValue: "",
        isActive: true,
      });
    }
  }, [discount]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    // Kiểm tra nếu là input number và giá trị âm
    if (type === "number") {
      const numValue = parseFloat(value);
      // Nếu giá trị âm, không cập nhật state
      if (numValue < 0) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.code.trim()) {
      setToast({ message: "Vui lòng nhập mã giảm giá", type: "error" });
      return;
    }
    if (!formData.value || Number(formData.value) <= 0) {
      setToast({
        message: "Vui lòng nhập giá trị giảm giá hợp lệ",
        type: "error",
      });
      return;
    }

    // Kiểm tra giá trị âm
    if (Number(formData.value) < 0) {
      setToast({ message: "Giá trị giảm giá không được âm", type: "error" });
      return;
    }

    if (formData.discountType === "PERCENT" && Number(formData.value) > 100) {
      setToast({
        message: "Phần trăm giảm giá không được vượt quá 100%",
        type: "error",
      });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setToast({
        message: "Vui lòng chọn thời gian bắt đầu và kết thúc",
        type: "error",
      });
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setToast({
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        type: "error",
      });
      return;
    }

    // Kiểm tra usageLimit và minOrderValue không âm
    if (formData.usageLimit && Number(formData.usageLimit) < 0) {
      setToast({ message: "Số lượng giới hạn không được âm", type: "error" });
      return;
    }
    if (formData.minOrderValue && Number(formData.minOrderValue) < 0) {
      setToast({
        message: "Giá trị đơn tối thiểu không được âm",
        type: "error",
      });
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      value: Number(formData.value),
      startDate: formData.startDate
        ? `${formData.startDate}T00:00:00`
        : undefined,
      endDate: formData.endDate ? `${formData.endDate}T23:59:59` : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
      minOrderValue: formData.minOrderValue
        ? Number(formData.minOrderValue)
        : 0,
      isActive: formData.isActive,
    };

    try {
      if (discount) {
        await discountService.update(discount.discountId, payload);
        setToast({
          message: "Cập nhật mã giảm giá thành công!",
          type: "success",
        });
      } else {
        await discountService.create(payload);
        setToast({
          message: "Thêm mã giảm giá thành công!",
          type: "success",
        });
      }

      setFormData({
        code: "",
        description: "",
        discountType: "PERCENT",
        value: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        minOrderValue: "",
        isActive: true,
      });

      if (onSuccess) onSuccess(payload);
      onClose();
    } catch (err: any) {
      let message = "Không thể lưu mã giảm giá";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      setToast({ message: `Lỗi: ${message}`, type: "error" });
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      handleSubmit();
    }

    // Ngăn nhập dấu trừ (-) và dấu cộng (+) cho input number
    if (
      e.target.type === "number" &&
      (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E")
    ) {
      e.preventDefault();
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
          >
            <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl pointer-events-auto my-8">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {discount ? "Sửa Mã Giảm Giá" : "Thêm Mã Giảm Giá Mới"}
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

              <div className="mt-6 space-y-4" onKeyDown={handleKeyDown}>
                {/* Mã giảm giá */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mã Giảm Giá <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Ví dụ: SUMMER2024"
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 uppercase"
                    />
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mô Tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả về chương trình giảm giá..."
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 resize-none"
                  />
                </div>

                {/* Loại & Giá trị giảm giá */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Loại Giảm Giá <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="PERCENT">Phần trăm (%)</option>
                      <option value="AMOUNT">Số tiền cố định (VNĐ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Giá Trị <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {formData.discountType === "PERCENT" ? (
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      )}
                      <input
                        type="number"
                        name="value"
                        value={formData.value}
                        onChange={handleChange}
                        placeholder={
                          formData.discountType === "PERCENT"
                            ? "Ví dụ: 20"
                            : "Ví dụ: 50000"
                        }
                        min="0"
                        step="0.01"
                        max={
                          formData.discountType === "PERCENT"
                            ? "100"
                            : undefined
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "+" ||
                            e.key === "e" ||
                            e.key === "E"
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Thời gian */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Ngày Bắt Đầu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Ngày Kết Thúc <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Giới hạn sử dụng & Đơn tối thiểu */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Số Lượng Giới Hạn
                    </label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleChange}
                      placeholder="Không giới hạn"
                      min="0"
                      onKeyDown={(e) => {
                        if (
                          e.key === "-" ||
                          e.key === "+" ||
                          e.key === "e" ||
                          e.key === "E"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Giá Trị Đơn Tối Thiểu (VNĐ)
                    </label>
                    <input
                      type="number"
                      name="minOrderValue"
                      value={formData.minOrderValue}
                      onChange={handleChange}
                      placeholder="Không yêu cầu"
                      min="0"
                      onKeyDown={(e) => {
                        if (
                          e.key === "-" ||
                          e.key === "+" ||
                          e.key === "e" ||
                          e.key === "E"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Trạng Thái
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:border-slate-600 dark:bg-slate-700 dark:peer-focus:ring-green-800"></div>
                    </label>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formData.isActive ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
                  >
                    {discount ? "Lưu thay đổi" : "Thêm mã giảm giá"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
