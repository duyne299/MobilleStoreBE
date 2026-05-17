import axiosClient from "@/lib/axiosClient";

export interface Category {
  categoryId: number;
  categoryName: string;
  slug: string;
  description?: string;
  parentId?: number | null;
  isActive: boolean;
  categoryImage?: string | null;
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
  create: async (data: Partial<Category>, image?: File) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (image) {
      formData.append("image", image);
    }

    const res = await axiosClient.post("/api/categories", formData);
    return res.data;
  },

  // Cập nhật category
  update: async (slug: string, data: Partial<Category>, image?: File) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (image) {
      formData.append("image", image);
    }

    const res = await axiosClient.put(`/api/categories/${slug}`, formData);
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
