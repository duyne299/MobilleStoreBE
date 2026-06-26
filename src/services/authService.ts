import axiosClient from "@/lib/axiosClient";


export const authService = {
  register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return axiosClient.post("/api/auth/signup", data);
  },

  login(data: { email: string; password: string }) {
    return axiosClient.post("/api/auth/login", data);
  },

  logout() {
    return axiosClient.post("/api/auth/logout");
  },

  getCurrentUser() {
    return axiosClient.get("/api/auth/profile");
  },

  // 🔹 Quên mật khẩu - Bước 1: Gửi OTP đến email
  sendForgotPasswordOtp(email: string) {
    return axiosClient.post("/api/auth/forgot-password", { email });
  },

  // 🔹 Quên mật khẩu - Bước 2: Xác minh OTP và đặt mật khẩu mới
  verifyOtpAndResetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    return axiosClient.post("/api/auth/reset-password", data);
  },
};
