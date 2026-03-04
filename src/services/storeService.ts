import axiosClient from "@/lib/axiosClient";

export interface Store {
  storeId: number;
  storeName: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
}

export const storeService = {
  // Lấy tất cả store
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Store[]; total: number }> => {
    const res = await axiosClient.get("/stores", { params });
    return res.data;
  },

  // Lấy chi tiết store theo id
  getOne: async (id: number): Promise<Store> => {
    const res = await axiosClient.get(`/stores/${id}`);
    return res.data;
  },

  // Thêm mới store
  create: async (data: Partial<Store>): Promise<Store> => {
    const res = await axiosClient.post("/stores", data);
    return res.data;
  },

  // Cập nhật store
  update: async (id: number, data: Partial<Store>): Promise<Store> => {
    const res = await axiosClient.patch(`/stores/${id}`, data);
    return res.data;
  },

  // Xóa store
  remove: async (id: number): Promise<void> => {
    await axiosClient.delete(`/stores/${id}`);
  },

  // Chuyển trạng thái active/inactive
  toggleStatus: async (id: number): Promise<Store> => {
    const res = await axiosClient.patch(`/stores/${id}/toggle`);
    return res.data;
  },
};
