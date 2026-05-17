import axiosClient from "@/lib/axiosClient";

export enum PaymentGateway {
  COD = "COD",
  VIETQR = "VIETQR",
  VNPAY = "VNPAY",
}

export interface VietQRPaymentResponse {
  qrCode: string;
  transactionCode: string;
}

export interface VNPayPaymentResponse {
  paymentUrl: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: string;
}

export const paymentService = {
  createVietQRPayment: async (data: {
    orderId: number;
    amount: number;
    description: string;
  }): Promise<VietQRPaymentResponse> => {
    const res = await axiosClient.post("/payment/vietqr/create", data);
    return res.data;
  },

  createVNPayPayment: async (data: {
    orderId: number;
    amount: number;
    returnUrl: string;
    orderInfo: string;
  }): Promise<VNPayPaymentResponse> => {
    const res = await axiosClient.post("/payment/vnpay/create", data);
    return res.data;
  },

  checkPaymentStatus: async (
    orderId: number,
  ): Promise<PaymentStatusResponse> => {
    const res = await axiosClient.get(`/payment/status/${orderId}`);
    return res.data;
  },
};
