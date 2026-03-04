"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function PaymentPromotions() {
    const [isHappy, setIsHappy] = useState<boolean | null>(null);

    const promotions = [
        {
            id: 1,
            image: "https://cdn2.fptshop.com.vn/unsafe/480x0/filters:format(webp):quality(75)/H3_405x175_3_bc399f2df6.png",
            alt: "Trả góp dễ - Ưu đãi mê",
            title: "Giảm ngay 200K - Trả góp 0% lãi phí"
        },
        {
            id: 2,
            image: "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:format(webp):quality(75)/H3_405x175_2_3046e3cd85.png",
            alt: "AI Đỉnh Quất Chết",
            title: "Trả trước 0Đ - Lãi suất 0%"
        },
        {
            id: 3,
            image: "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:format(webp):quality(75)/H3_405x175_3_bc399f2df6.png",
            alt: "AI Đỉnh Sống Chết Chơi",
            title: "Giảm ngay 5% - Tới đa 80,000Đ"
        }
    ];

    return (
        <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl px-6 sm:p-8 mb-6">
                    {/* Title Section */}
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Ưu đãi thanh toán
                        </h2>
                    </div>

                    {/* Promotions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 ">
                        {promotions.map((promo, index) => (
                            <motion.div
                                key={promo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ scale: 1.02 }}
                                className={`relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group ${index > 0 ? 'hidden lg:block' : ''
                                    }`}
                            >
                                <img
                                    src={promo.image}
                                    alt={promo.alt}
                                    className="w-full h-48 sm:h-56 max-h-38 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-white rounded-2xl px-6 sm:px-8 sm:py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Question Section */}
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                Bạn có hài lòng với trải nghiệm trên trang chủ của chúng tôi không?
                            </h3>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsHappy(true)}
                                    className={`px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${isHappy === true
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                        : 'bg-white text-red-600 border-2 hover:bg-red-50'

                                        }`}
                                    style={{ border: '1px solid #ef4444' }}
                                >
                                    Hài lòng
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsHappy(false)}
                                    className={`px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${isHappy === false
                                        ? 'bg-gray-600 text-white shadow-lg shadow-gray-200'
                                        : 'bg-white text-red-600 border-2 border-gray-400 hover:bg-gray-50'
                                        }`}
                                    style={{ border: '1px solid #ef4444' }}
                                >
                                    Không hài lòng
                                </motion.button>
                            </div>

                            {/* Feedback Message */}
                            {isHappy !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4"
                                >
                                    {isHappy ? (
                                        <p className="text-green-600 font-medium text-sm sm:text-base flex items-center gap-2">
                                            <span className="text-2xl">✓</span>
                                            Cảm ơn bạn đã đánh giá! Chúng tôi sẽ tiếp tục cải thiện dịch vụ.
                                        </p>
                                    ) : (
                                        <p className="text-orange-600 font-medium text-sm sm:text-base flex items-center gap-2">
                                            <span className="text-2xl">!</span>
                                            Rất tiếc vì trải nghiệm chưa tốt. Vui lòng cho chúng tôi biết cách cải thiện!
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Illustration */}
                        <div className="flex-shrink-0">
                            <img
                                src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/desktop_1x_374d8eccab.png"
                                alt="Feedback illustration"
                                className="w-48 sm:w-64 h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}