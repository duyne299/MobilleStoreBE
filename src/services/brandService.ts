import axiosClient from "@/lib/axiosClient";

export interface Brand {
  brandId: number;
  brandName: string;
  slug: string;
  brandLogo?: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const brandService = {
  // Lấy danh sách brand với phân trang/search
  async findAll(params?: PaginationParams) {
    const res = await axiosClient.get("/brands", { params });
    return res.data; // { data, total }
  },

  // Lấy chi tiết brand theo id
  async findOne(id: number) {
    const res = await axiosClient.get(`/brands/${id}`);
    return res.data;
  },

  // Thêm brand mới (FormData để upload logo)
  async create(formData: FormData) {
    const res = await axiosClient.post("/brands", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Cập nhật brand (DTO object)
  async update(id: number, dto: Partial<Brand>) {
    const res = await axiosClient.put(`/brands/${id}`, dto);
    return res.data;
  },

  // Xóa brand
  async remove(id: number) {
    const res = await axiosClient.delete(`/brands/${id}`);
    return res.data;
  },

  // Cập nhật trạng thái active/inactive
  async updateStatus(slug: string, isActive: boolean) {
    const res = await axiosClient.patch(`/brands/${slug}/status`, { isActive });
    return res.data;
  },

  // Kiểm tra tên brand đã tồn tại chưa
  async checkName(name: string) {
    const res = await axiosClient.get("/brands/check-name", { params: { name } });
    return res.data.exists;
  },
};
