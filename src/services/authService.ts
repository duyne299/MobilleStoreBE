import axiosClient from "@/lib/axiosClient";


export const authService = {
  register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return axiosClient.post("/auth/register", data);
  },

  login(data: { email: string; password: string }) {
    return axiosClient.post("/auth/login", data);
  },

  logout() {
    return axiosClient.post("/auth/logout");
  },

  getCurrentUser() {
    return axiosClient.get("/auth/profile");
  },
};
