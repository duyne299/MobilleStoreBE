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
        </div>
      </div>
    </div>
  );
}
