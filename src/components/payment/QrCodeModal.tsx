    'use client';
    import React, { useState, useEffect } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { X, Loader2 } from 'lucide-react';

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
        const [timeLeft, setTimeLeft] = useState(600);

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

        useEffect(() => {
            if (!isOpen) return;

            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            console.log(qrCodeURL)

            return () => clearInterval(timer);
        }, [isOpen]);

        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

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
                            {/* Timer */}
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full font-mono font-bold text-lg">
                                    {formatTime(timeLeft)}
                                </div>
                            </div>

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

                            {/* Loading Indicator */}
                            <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-medium">Đang chờ thanh toán...</span>
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-sm mb-2 text-blue-900">Hướng dẫn thanh toán:</h4>
                                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                                    <li>Chọn chức năng quét mã QR</li>
                                    <li>Quét mã QR hiển thị trên màn hình</li>
                                    <li>Kiểm tra số tiền và nội dung chuyển khoản</li>
                                    <li>Xác nhận và hoàn tất thanh toán</li>
                                </ol>
                            </div>

                            {/* Warning */}
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    ⚠️ Vui lòng không tắt cửa sổ này cho đến khi thanh toán thành công. 
                                    Nếu đóng cửa sổ, đơn hàng sẽ không được xử lý.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    }