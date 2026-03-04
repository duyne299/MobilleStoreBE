'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { useDiscounts } from '@/hooks/useDiscount';
import { Discount } from '@/services/discountService';

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDiscount: (discount: Discount, code: string) => void;
    currentTotal: number;
    appliedDiscountCode?: string;
}

export default function DiscountModal({
    isOpen,
    onClose,
    onSelectDiscount,
    currentTotal,
    appliedDiscountCode
}: DiscountModalProps) {
    const [manualCode, setManualCode] = useState('');
    const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
    const [manualError, setManualError] = useState<string | null>(null);
    const [isApplyingManual, setIsApplyingManual] = useState(false);

    // Sử dụng hook useDiscounts
    const { discounts, loading, error, fetchDiscounts, applyDiscount } = useDiscounts(9999);
    

    useEffect(() => {
        if (isOpen) {
            // Fetch tất cả discounts khi mở modal
            fetchDiscounts({ page: 1, limit: 9999 });
        }
    }, [isOpen]);

    // Lọc các mã giảm giá phù hợp với đơn hàng
    const eligibleDiscounts = discounts.filter((discount) => {
        const minOrderValue = discount.minOrderValue || 0;
        const isValidDate = new Date(discount.startDate) <= new Date() && 
                          new Date(discount.endDate) >= new Date();
        
        return (
            discount.isActive &&
            minOrderValue <= currentTotal &&
            isValidDate
        );
    });

    const calculateDiscountAmount = (discount: Discount): number => {
        if (discount.discountType === 'PERCENT') {
            const discountAmount = (currentTotal * discount.value) / 100;
            return discountAmount;
        } else if (discount.discountType === 'AMOUNT') {
            return Math.min(discount.value, currentTotal);
        }
        return 0;
    };

    const formatPrice = (price: number): string => {
        return price.toLocaleString('vi-VN') + 'đ';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const handleSelectDiscount = (discount: Discount) => {
        setSelectedDiscount(discount.discountId);
    };

    const handleApplyDiscount = () => {
        if (selectedDiscount) {
            const discount = eligibleDiscounts.find(d => d.discountId === selectedDiscount);
            if (discount) {
                onSelectDiscount(discount, discount.code);
                onClose();
            }
        }
    };

    const handleApplyManualCode = async () => {
        if (!manualCode.trim()) {
            setManualError('Vui lòng nhập mã giảm giá');
            return;
        }

        setIsApplyingManual(true);
        setManualError(null);

        try {
            // Sử dụng applyDiscount từ hook
            const result = await applyDiscount(manualCode.trim().toUpperCase(), currentTotal);
            
            // Nếu áp dụng thành công, gọi callback và đóng modal
            onSelectDiscount(result, manualCode.trim().toUpperCase());
            onClose();
        } catch (err: any) {
            setManualError(err.message || 'Mã giảm giá không hợp lệ');
        } finally {
            setIsApplyingManual(false);
        }
    };

    const getDiscountLabel = (discount: Discount): string => {
        if (discount.discountType === 'PERCENT') {
            return `Giảm ${discount.value}%`;
        } else if (discount.discountType === 'AMOUNT') {
            return `Giảm ${formatPrice(discount.value)}`;
        }
        return 'Giảm giá';
    };

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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold">Chọn mã giảm giá</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Manual Code Input */}
                        <div className="p-6 border-b bg-gray-50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => {
                                        setManualCode(e.target.value.toUpperCase());
                                        setManualError(null);
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleApplyManualCode();
                                        }
                                    }}
                                    placeholder="Nhập mã giảm giá"
                                    className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <button
                                    onClick={handleApplyManualCode}
                                    disabled={isApplyingManual || !manualCode.trim()}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {isApplyingManual ? 'Đang xử lý...' : 'Áp dụng'}
                                </button>
                            </div>
                            {manualError && (
                                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{manualError}</span>
                                </div>
                            )}
                        </div>

                        {/* Discount List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">Đang tải mã giảm giá...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                                    <p className="text-gray-600">{error}</p>
                                    <button
                                        onClick={() => fetchDiscounts({ page: 1, limit: 9999 })}
                                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : eligibleDiscounts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 font-medium">Không có mã giảm giá khả dụng</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {currentTotal < 100000 
                                            ? `Đơn hàng cần tối thiểu ${formatPrice(100000)} để áp dụng mã giảm giá`
                                            : 'Hiện tại không có mã giảm giá phù hợp với đơn hàng của bạn'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Có <span className="font-semibold text-red-600">{eligibleDiscounts.length}</span> mã giảm giá khả dụng cho đơn hàng của bạn
                                    </p>
                                    {eligibleDiscounts.map((discount) => {
                                        const discountAmount = calculateDiscountAmount(discount);
                                        const isSelected = selectedDiscount === discount.discountId;
                                        const isApplied = appliedDiscountCode === discount.code;

                                        return (
                                            <motion.div
                                                key={discount.discountId}
                                                whileHover={{ scale: 1.01 }}
                                                onClick={() => handleSelectDiscount(discount)}
                                                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'border-red-500 bg-red-50 shadow-md'
                                                        : isApplied
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                            >
                                                {isApplied && (
                                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                        <Check className="w-3 h-3" />
                                                        Đang áp dụng
                                                    </div>
                                                )}

                                                <div className="flex items-start gap-4">
                                                    {/* Icon */}
                                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                                                        <Tag className="w-6 h-6 text-white" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-lg text-red-600">
                                                                {discount.code}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {discount.description && (
                                                            <p className="text-sm text-gray-700 mb-2">
                                                                {discount.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                                                            <span>
                                                                <span className="font-semibold text-red-600">
                                                                    {getDiscountLabel(discount)}
                                                                </span>
                                                            </span>
                                                            {discount.minOrderValue && discount.minOrderValue > 0 && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>
                                                                        Đơn tối thiểu: {formatPrice(discount.minOrderValue)}
                                                                    </span>
                                                                </>
                                                            )}
                                                            {discount.usageLimit && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>
                                                                        Còn {discount.usageLimit} lượt
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                                            <span className="text-xs text-gray-500">
                                                                HSD: {formatDate(discount.endDate)}
                                                            </span>
                                                            <span className="text-sm font-bold text-green-600">
                                                                Tiết kiệm {formatPrice(discountAmount)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <ChevronRight className={`w-5 h-5 flex-shrink-0 mt-1 transition-colors ${
                                                        isSelected ? 'text-red-500' : 'text-gray-400'
                                                    }`} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {eligibleDiscounts.length > 0 && (
                            <div className="p-6 border-t bg-gray-50">
                                <button
                                    onClick={handleApplyDiscount}
                                    disabled={!selectedDiscount}
                                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {selectedDiscount 
                                        ? `Áp dụng mã ${eligibleDiscounts.find(d => d.discountId === selectedDiscount)?.code}`
                                        : 'Chọn mã giảm giá'
                                    }
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}