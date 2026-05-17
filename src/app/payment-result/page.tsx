"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { orderService } from "@/services/orderService";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [orderId, setOrderId] = useState<number | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        const processPayment = async () => {
            const responseCode = searchParams.get("vnp_ResponseCode");
            const txnRef = searchParams.get("vnp_TxnRef");
            const amountParam = searchParams.get("vnp_Amount");

            if (!txnRef) {
                setStatus("error");
                setErrorMessage("Không tìm thấy thông tin mã đơn hàng!");
                return;
            }

            const parsedOrderId = parseInt(txnRef);
            setOrderId(parsedOrderId);

            if (amountParam) {
                setAmount(parseFloat(amountParam));
            }

            if (responseCode === "00") {
                try {
                    // Update status to PAID on backend
                    await orderService.updateStatus(parsedOrderId, {
                        status: "PAID"
                    });
                    
                    // Clear cart in session storage
                    sessionStorage.removeItem("checkoutData");
                    localStorage.removeItem("cart"); // if any client cart exists
                    
                    setStatus("success");
                } catch (err: any) {
                    console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
                    setStatus("error");
                    setErrorMessage("Không thể cập nhật trạng thái đơn hàng nhưng thanh toán đã thành công. Vui lòng liên hệ hỗ trợ!");
                }
            } else {
                setStatus("error");
                setErrorMessage("Giao dịch thanh toán không thành công hoặc đã bị hủy bởi người dùng.");
            }
        };

        processPayment();
    }, [searchParams]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Đang kiểm tra trạng thái giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100 text-center relative overflow-hidden"
            >
                {/* Backdrop Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 blur-[80px] opacity-20 -z-10 rounded-full ${
                    status === "success" ? "bg-emerald-500" : "bg-red-500"
                }`} />

                {status === "success" ? (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                            className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-12 h-12" />
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-500 text-sm sm:text-base mb-8">
                            Cảm ơn bạn đã tin tưởng mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đang được xử lý chuẩn bị.
                        </p>

                        <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3 mb-8 border border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Mã đơn hàng:</span>
                                <span className="text-gray-900 font-bold">#{orderId}</span>
                            </div>
                            {amount && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Số tiền đã thanh toán:</span>
                                    <span className="text-emerald-600 font-bold text-base">{formatPrice(amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Trạng thái đơn hàng:</span>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                                    Đã thanh toán
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => router.push("/profile?tab=orders")}
                                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Xem đơn hàng của tôi
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                Tiếp tục mua sắm
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                            className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <XCircle className="w-12 h-12" />
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thất bại</h2>
                        <p className="text-gray-500 text-sm sm:text-base mb-8">
                            {errorMessage || "Đã xảy ra lỗi không xác định trong quá trình giao dịch."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => router.push("/cart")}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-2xl font-bold transition-all active:scale-[0.98]"
                            >
                                Quay lại giỏ hàng
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-4 px-6 rounded-2xl font-bold transition-all active:scale-[0.98]"
                            >
                                Quay về trang chủ
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default function PaymentResultPage() {
    return (
        <>
            <Header />
            <div className="min-h-[80vh] bg-gradient-to-b from-gray-50 to-gray-100/50 flex items-center justify-center">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Đang tải...</p>
                    </div>
                }>
                    <PaymentResultContent />
                </Suspense>
            </div>
            <Footer />
        </>
    );
}
