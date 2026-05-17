import axiosClient from "@/lib/axiosClient";

export const productService = {
  // Lấy sản phẩm với phân trang và search
  async getAll(params?: { page?: number; limit?: number; search?: string }) {
    const res = await axiosClient.get("/api/products", {
      params: params || {},
    });
    return res.data; // backend trả về { data: Product[], total: number }
  },

  // Lấy chi tiết sản phẩm theo slug
  async getBySlug(slug: string): Promise<any> {
    const res = await axiosClient.get(`/api/products/${slug}`);
    return res.data;
  },

  // Thêm sản phẩm mới
  async create(data: any, files?: File[]): Promise<any> {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    if (files && files.length > 0) {
      files.forEach((file) => formData.append("images", file));
    }

    const res = await axiosClient.post("/api/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Cập nhật sản phẩm (gửi FormData nếu có file)
  async update(slug: string, data: any, files?: File[]): Promise<any> {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    if (files && files.length > 0) {
      files.forEach((file) => formData.append("images", file));
    }

    const res = await axiosClient.put(`/api/products/${slug}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Xóa sản phẩm
  async remove(id: number): Promise<any> {
    const res = await axiosClient.delete(`/api/products/${id}`);
    return res.data;
  },

  async changeStatus(id: number, isActive: boolean): Promise<any> {
    const res = await axiosClient.patch(`/api/products/${id}/status`, {
      isActive,
    });
    return res.data;
  },

  // services/productService.js
  getByCategoryId: async (categoryId: number) => {
    const response = await axiosClient.get(`/api/products/category/${categoryId}`);
    return response.data;
  },
};
