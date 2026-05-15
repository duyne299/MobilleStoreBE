import axiosClient from "@/lib/axiosClient";

export interface Category {
  categoryId: number;
  categoryName: string;
  slug: string;
  description?: string;
  parentId?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const categoryService = {
  // Lấy danh sách category với phân trang/search
  getAll: async (params: FindAllParams) => {
    const res = await axiosClient.get("/api/categories", { params });
    return res.data; // { data: Category[], total: number }
  },

  // Lấy chi tiết category theo slug
  getOne: async (idOrSlug: string | number) => {
    const res = await axiosClient.get(`/api/categories/${idOrSlug}`);
    return res.data;
  },

  // Kiểm tra tên category đã tồn tại chưa
  checkName: async (name: string) => {
    const res = await axiosClient.get("/api/categories/check-name", {
      params: { name },
    });
    return res.data.exists;
  },

  // Thêm category mới
  create: async (data: Partial<Category>) => {
    const res = await axiosClient.post("/api/categories", data);
    return res.data;
  },

  // Cập nhật category
  update: async (slug: string, data: Partial<Category>) => {
    const res = await axiosClient.put(`/api/categories/${slug}`, data);
    return res.data;
  },

  // Cập nhật trạng thái active/inactive
  updateStatus: async (slug: string, isActive: boolean) => {
    const res = await axiosClient.patch(`/api/categories/${slug}/status`, {
      isActive,
    });
    return res.data;
  },

  // Xóa category
  remove: async (id: number) => {
    const res = await axiosClient.delete(`/api/categories/${id}`);
    return res.data;
  },

};
