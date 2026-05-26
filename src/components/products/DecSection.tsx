import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Cpu,
  HardDrive,
  Camera,
  Battery,
  Ruler,
  Layers,
  FileText,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function DecSection({ product }: { product: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!product) return null;

  const spec = product.specification;

  // Icons and labels mapping for visual display
  const getIcon = (key: string) => {
    switch (key) {
      case "os":
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case "display":
        return <Smartphone className="w-4 h-4 text-blue-500" />;
      case "cpu":
      case "gpu":
        return <Cpu className="w-4 h-4 text-purple-500" />;
      case "ram":
        return <Cpu className="w-4 h-4 text-pink-500" />;
      case "rom":
        return <HardDrive className="w-4 h-4 text-cyan-500" />;
      case "cameraFront":
      case "cameraRear":
        return <Camera className="w-4 h-4 text-amber-500" />;
      case "battery":
        return <Battery className="w-4 h-4 text-emerald-500" />;
      case "weight":
      case "size":
        return <Ruler className="w-4 h-4 text-teal-500" />;
      case "sim":
        return <Layers className="w-4 h-4 text-orange-500" />;
      case "material":
        return <Layers className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  // Top summary specs to show directly in the right column card (6 items max)
  const summarySpecs = spec
    ? [
        { label: "Màn hình", value: spec.display, key: "display" },
        { label: "Hệ điều hành", value: spec.os, key: "os" },
        { label: "Camera sau", value: spec.cameraRear, key: "cameraRear" },
        { label: "Chipset (CPU)", value: spec.cpu, key: "cpu" },
        { label: "RAM", value: spec.ram, key: "ram" },
        { label: "Dung lượng pin", value: spec.battery, key: "battery" },
      ].filter((item) => item.value && item.value.trim() !== "")
    : [];

  // All specs to show in modal
  const allSpecs = spec
    ? [
        { label: "Màn hình", value: spec.display, key: "display" },
        { label: "Hệ điều hành (OS)", value: spec.os, key: "os" },
        { label: "Bộ vi xử lý (CPU)", value: spec.cpu, key: "cpu" },
        { label: "Đồ họa (GPU)", value: spec.gpu, key: "gpu" },
        { label: "Bộ nhớ RAM", value: spec.ram, key: "ram" },
        { label: "Bộ nhớ trong (ROM)", value: spec.rom, key: "rom" },
        { label: "Camera trước", value: spec.cameraFront, key: "cameraFront" },
        { label: "Camera sau", value: spec.cameraRear, key: "cameraRear" },
        { label: "Dung lượng pin", value: spec.battery, key: "battery" },
        { label: "Trọng lượng", value: spec.weight, key: "weight" },
        { label: "Kích thước", value: spec.size, key: "size" },
        { label: "Thẻ SIM", value: spec.sim, key: "sim" },
        { label: "Chất liệu", value: spec.material, key: "material" },
      ].filter((item) => item.value && item.value.trim() !== "")
    : [];

  return (
    <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Đặc điểm nổi bật */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100/80">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                Đặc điểm nổi bật
              </h2>

              <div
                className={`prose prose-blue max-w-none transition-all duration-500 overflow-hidden relative ${
                  !isExpanded ? "max-h-[600px]" : "max-h-none"
                }`}
              >
                <div
                  className="text-gray-700 leading-relaxed text-sm sm:text-base"
                  dangerouslySetInnerHTML={{
                    __html: product.description || "Đang cập nhật nội dung...",
                  }}
                />

                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                )}
              </div>

              <div className="mt-6 flex justify-center border-t border-gray-50 pt-6">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-all hover:scale-105 cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      Thu gọn <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Xem thêm mô tả <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Cột phải: Thông số kỹ thuật */}
          <div className="lg:col-span-4 space-y-6">
            {spec && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                  <span className="w-1.5 h-5.5 bg-red-600 rounded-full" />
                  Thông số kỹ thuật
                </h3>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                  <div className="divide-y divide-gray-100">
                    {summarySpecs.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center py-3.5 px-4 hover:bg-gray-50/55 transition-colors"
                      >
                        <div className="w-1/2 sm:w-1/3 flex items-center gap-2 text-xs font-semibold text-gray-500">
                          {getIcon(item.key)}
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="w-1/2 sm:w-2/3 text-xs sm:text-sm text-gray-900 font-semibold pl-2 line-clamp-2">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 rounded-2xl border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold transition-all hover:bg-gray-50 text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    Xem cấu hình chi tiết
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal thông số kỹ thuật chi tiết */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col z-10 border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-red-600 rounded-full" />
                  Thông số kỹ thuật chi tiết
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white divide-y divide-gray-100">
                  {allSpecs.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row sm:items-center py-4 px-5 transition-colors ${
                        idx % 2 === 0 ? "bg-gray-50/40" : "bg-white"
                      } hover:bg-red-50/10`}
                    >
                      <div className="sm:w-1/3 flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 pb-1.5 sm:pb-0">
                        {getIcon(item.key)}
                        <span>{item.label}</span>
                      </div>
                      <div className="sm:w-2/3 text-xs sm:text-sm text-gray-900 font-semibold sm:font-medium">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all hover:scale-105 text-sm cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
