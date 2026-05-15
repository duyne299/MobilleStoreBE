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
};
