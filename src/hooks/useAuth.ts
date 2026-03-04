import { authService } from "@/services/authService";
import { useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(data);
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login(data);

      // Lấy token & thông tin user
      const token = res.data?.access_token;
      const user = res.data?.user;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      localStorage.removeItem("token");
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng xuất thất bại");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const res = await authService.getCurrentUser();
      setUser(res);
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || "Không lấy được thông tin user");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    fetchCurrentUser,
  };
};
