    'use client';
    import React, { useEffect } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { X } from 'lucide-react';

    interface QRCodeModalProps {
        isOpen: boolean;
        qrCodeURL: string;
        amount: number;
        transactionCode: string;
        onClose: () => void;
        onPaymentSuccess: () => void;
    }

    export default function QRCodeModal({ 
        isOpen, 
        qrCodeURL, 
        amount, 
        transactionCode,
        onClose,
        onPaymentSuccess 
    }: QRCodeModalProps) {

        // Ngăn scroll khi modal mở
        useEffect(() => {
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'unset';
            }

            return () => {
                document.body.style.overflow = 'unset';
            };
        }, [isOpen]);

        const formatPrice = (price: number) => {
            return price.toLocaleString('vi-VN') + 'đ';
        };

        if (!isOpen) return null;

        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center pt-40 p-4 bg-black/50 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl my-8 "
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700  text-white p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Quét mã QR để thanh toán</h3>
                                    <p className="text-blue-100 text-sm">Sử dụng ứng dụng ngân hàng để quét mã</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* QR Code */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-blue-100">
                                    <img 
                                        src={qrCodeURL} 
                                        alt="QR Code" 
                                        className="w-64 h-64 object-contain"
                                    />
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-3 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Số tiền cần thanh toán</span>
                                        <span className="text-xl font-bold text-red-600">{formatPrice(amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Mã giao dịch</span>
                                        <span className="font-semibold font-mono">{transactionCode}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Payment Button */}
                            <button
                                onClick={onPaymentSuccess}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mb-4 transition-colors shadow-md flex items-center justify-center"
                            >
                                Xác nhận thanh toán
                            </button>

                            {/* Instructions */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-sm mb-2 text-blue-900">Hướng dẫn thanh toán:</h4>
                                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                                    <li>Chọn chức năng quét mã QR</li>
                                    <li>Quét mã QR hiển thị trên màn hình</li>
                                    <li>Kiểm tra số tiền và nội dung chuyển khoản</li>
                                    <li>Xác nhận và hoàn tất thanh toán</li>
                                    <li>Quay lại màn hình này và nhấn nút <strong>Xác nhận thanh toán</strong></li>
                                </ol>
                            </div>

                            {/* Warning */}
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    ⚠️ Vui lòng hoàn tất chuyển khoản trước khi nhấn &apos;Xác nhận thanh toán&apos;. 
                                    Nếu đóng cửa sổ hoặc chưa thanh toán, đơn hàng sẽ không được xử lý.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    }