import { useState, useCallback } from "react";
import { paymentService } from "@/services/paymentService";

export function usePayment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createVietQRPayment = useCallback(async (data: { orderId: number; amount: number; description: string }) => {
        setLoading(true);
        setError(null);
        try {
            return await paymentService.createVietQRPayment(data);
        } catch (err: any) {
            setError(err.message || "Failed to create VietQR payment");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createVNPayPayment = useCallback(async (data: { orderId: number; amount: number; returnUrl: string; orderInfo: string }) => {
        setLoading(true);
        setError(null);
        try {
            return await paymentService.createVNPayPayment(data);
        } catch (err: any) {
            setError(err.message || "Failed to create VNPay payment");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const startVietQRPolling = useCallback((orderId: number, onSuccess: () => void, interval = 3000, maxAttempts = 100) => {
        let attempts = 0;
        const timer = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(timer);
                return;
            }
            try {
                const res = await paymentService.checkPaymentStatus(orderId);
                if (res.success || res.status === "PAID" || res.status === "SUCCESS") {
                    clearInterval(timer);
                    onSuccess();
                }
            } catch (err) {
                console.error("Error checking payment status:", err);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return {
        loading,
        error,
        createVietQRPayment,
        createVNPayPayment,
        startVietQRPolling
    };
}
