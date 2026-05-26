import React, { useState } from "react";

export default function DecSection({ product }: { product: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!product) return null;

  return (
    <div className="bg-[#F3F4F6] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Đặc điểm nổi bật
          </h2>

          <div
            className={`prose prose-blue max-w-none transition-all duration-500 overflow-hidden ${!isExpanded ? "max-h-[500px] relative" : "max-h-none"}`}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: product.description || "Đang cập nhật nội dung...",
              }}
            />

            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-8 py-2.5 rounded-full border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
            >
              {isExpanded ? "Thu gọn" : "Xem thêm mô tả"}
            </button>
          </div>

          {/* Bảng thông số kỹ thuật chi tiết */}
          {product.specification && (
            <div id="specs-section" className="mt-10 pt-8 border-t border-gray-250">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Thông số kỹ thuật chi tiết
              </h3>
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="divide-y divide-gray-100">
                  {[
                    { label: "Hệ điều hành (OS)", value: product.specification.os },
                    { label: "Màn hình", value: product.specification.display },
                    { label: "Bộ vi xử lý (CPU)", value: product.specification.cpu },
                    { label: "Đồ họa (GPU)", value: product.specification.gpu },
                    { label: "Bộ nhớ RAM", value: product.specification.ram },
                    { label: "Bộ nhớ trong (ROM)", value: product.specification.rom },
                    { label: "Camera trước", value: product.specification.cameraFront },
                    { label: "Camera sau", value: product.specification.cameraRear },
                    { label: "Dung lượng pin", value: product.specification.battery },
                    { label: "Trọng lượng", value: product.specification.weight },
                    { label: "Kích thước", value: product.specification.size },
                    { label: "Thẻ SIM", value: product.specification.sim },
                    { label: "Chất liệu", value: product.specification.material },
                  ]
                    .filter((field) => field.value && field.value.trim() !== "")
                    .map((field, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col sm:flex-row sm:items-center py-3.5 px-4 transition-colors ${
                          idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                        } hover:bg-blue-50/20`}
                      >
                        <div className="sm:w-1/3 text-sm font-semibold text-gray-500 pb-1 sm:pb-0">
                          {field.label}
                        </div>
                        <div className="sm:w-2/3 text-sm text-gray-900 font-medium">
                          {field.value}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
