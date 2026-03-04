import axiosClient from "@/lib/axiosClient";

export interface User {
  userId: number;
  fullName?: string | null;
  email: string;
  password: string;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  role: string;
  status: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const userService = {
  // Lấy danh sách user với phân trang/search
  getAll: async (params: FindAllParams) => {
    const res = await axiosClient.get("/users", { params });
    return res.data;
  },

  // Lấy chi tiết user theo id
  getOne: async (id: number) => {
    const res = await axiosClient.get(`/users/${id}`);
    return res.data;
  },

  // Thêm user mới
  create: async (data: Partial<User>, avatarFile?: File) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });
    if (avatarFile) formData.append("avatar", avatarFile);

    const res = await axiosClient.post("/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Cập nhật user
  update: async (id: number, data: Partial<User>, avatarFile?: File) => {
    const formData = new FormData();
    for (const key in data) {
      const value = (data as any)[key];
      if (key === "status") {
        formData.append(key, value ? "true" : "false");
        continue;
      }
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
    if (avatarFile) formData.append("avatar", avatarFile);

    const res = await axiosClient.put(`/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Cập nhật trạng thái active/inactive
  updateStatus: async (id: number, isActive: boolean) => {
    const res = await axiosClient.patch(`/users/${id}/status`, {
      status: isActive,
    });
    return res.data;
  },

  // Thay đổi role user
  changeRole: async (id: number, role: string) => {
    const res = await axiosClient.put(`/users/${id}/role`, { role });
    return res.data;
  },

  // Xóa user
  remove: async (id: number) => {
    const res = await axiosClient.delete(`/users/${id}`);
    return res.data;
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    const res = await axiosClient.get("/users/me");
    return res.data;
  },
};
