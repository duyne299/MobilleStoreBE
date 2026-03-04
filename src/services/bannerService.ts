import axiosClient from "@/lib/axiosClient";

export interface Banner {
  bannerId: number;
  title: string | null;
  imageUrl: string | null;
  excerpt: string | null;
  linkTarget: string | null; // slug hoặc id trỏ đến bài viết/sản phẩm
  position: string | null;
  isActive: boolean;
  startDate?: string | null; // ISO datetime
  endDate?: string | null; // ISO datetime
  createdAt: string;
  updatedAt: string;
}

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const bannerService = {
  // Lấy danh sách banner có phân trang + search
  getAll: async (params: FindAllParams) => {
    const res = await axiosClient.get("/banners", { params });
    return res.data; // { data: Banner[], total: number }
  },

  // Lấy banner đang active
  getActive: async () => {
    const res = await axiosClient.get("/banners/active");
    return res.data;
  },

  // Lấy chi tiết 1 banner theo id
  getOne: async (bannerId: number) => {
    const res = await axiosClient.get(`/banners/${bannerId}`);
    return res.data;
  },

  // Tạo banner mới (có upload file)
  create: async (formData: FormData) => {
    const res = await axiosClient.post("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Cập nhật banner (có upload file)
  update: async (bannerId: number, formData: FormData) => {
    const res = await axiosClient.put(`/banners/${bannerId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Cập nhật trạng thái isActive
  updateStatus: async (bannerId: number, isActive: boolean) => {
    const res = await axiosClient.patch(`/banners/${bannerId}/status`, {
      isActive,
    });
    return res.data;
  },

  // Xóa banner
  remove: async (bannerId: number) => {
    const res = await axiosClient.delete(`/banners/${bannerId}`);
    return res.data;
  },
};
