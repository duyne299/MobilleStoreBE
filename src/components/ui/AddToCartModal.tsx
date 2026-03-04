import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingCart, X } from 'lucide-react';

export default function AddToCartModal ({ isOpen, onClose, onViewCart, productName, productImage, price }: {
  isOpen: boolean;
  onClose: () => void;
  onViewCart: () => void;
  productName: string;
  productImage: string;
  price: number;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Thêm vào giỏ hàng thành công!</h3>
                  <p className="text-sm text-white/90">Sản phẩm đã được thêm vào giỏ hàng của bạn</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex gap-4 items-start bg-gray-50 rounded-xl p-4 mb-6">
                <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 line-clamp-2 mb-1">
                    {productName}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {price.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Tiếp tục mua hàng
                </button>
                <button
                  onClick={onViewCart}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Xem giỏ hàng
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};