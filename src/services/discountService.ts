import axiosClient from "@/lib/axiosClient";

export interface Discount {
  discountId: number;
  code: string;
  description?: string; 
  discountType: "PERCENT" | "AMOUNT" | string;
  value: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  isActive: boolean;
  minOrderValue?: number;
  createdAt: string;
  updateAt: string;
}

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const discountService = {
  // Lấy danh sách discount với phân trang/search
  getAll: async (params: FindAllParams) => {
    const res = await axiosClient.get("/discounts", { params });
    return res.data; // { data: Discount[], total: number }
  },

  // Lấy chi tiết discount theo id
  getOne: async (id: number) => {
    const res = await axiosClient.get(`/discounts/${id}`);
    return res.data;
  },

  // Thêm discount mới
  create: async (data: Partial<Discount>) => {
    const res = await axiosClient.post("/discounts", data);
    return res.data;
  },

  // Cập nhật discount
  update: async (id: number, data: Partial<Discount>) => {
    const res = await axiosClient.patch(`/discounts/${id}`, data);
    return res.data;
  },

  // Xóa discount
  remove: async (id: number) => {
    const res = await axiosClient.delete(`/discounts/${id}`);
    return res.data;
  },

  // Áp dụng mã giảm giá
  apply: async (code: string, total: number) => {
    const res = await axiosClient.get("/discounts/apply/code", {
      params: { code, total },
    });
    return res.data; // { success: boolean, discountAmount: number, message: string }
  },

  updateStatus: async (id: number, isActive: boolean) => {
    const res = await axiosClient.patch(`/discounts/${id}/status`, {
      isActive,
    });
    return res.data;
  },
};
