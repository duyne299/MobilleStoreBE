import axiosClient from "@/lib/axiosClient";

export interface ProductVariantProduct {
  proId: number;
  proName: string;
  slug: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  soldQuantity: number;
  origin: string;
  warranty: string;
}

export interface ProductVariant {
  optionId: number;
  product: ProductVariantProduct;
  rom: string | null;
  color: string | null;
  extraPrice: number;
  isActive: boolean;
  warehouseId?: number;
  quantity?: number;
  importPrice?: number;
  baseSalePrice?: number;
  createdAt: string;
  updatedAt: string;
}

export const productVariantService = {
  // Lấy tất cả variant
  getAll: async (): Promise<ProductVariant[]> => {
    const res = await axiosClient.get("/product-options");
    return res.data;
  },

  // Lấy chi tiết theo id
  getOne: async (id: number): Promise<ProductVariant> => {
    const res = await axiosClient.get(`/product-options/${id}`);
    return res.data;
  },

  // Thêm mới
  create: async (data: Partial<ProductVariant>): Promise<ProductVariant> => {
    const res = await axiosClient.post("/product-options", data);
    return res.data;
  },

  // Cập nhật
  update: async (
    id: number,
    data: Partial<ProductVariant>,
  ): Promise<ProductVariant> => {
    const res = await axiosClient.put(`/product-options/${id}`, data);
    return res.data;
  },

  // Cập nhật trạng thái active/inactive
  updateStatus: async (
    id: number,
    isActive: boolean,
  ): Promise<ProductVariant> => {
    const res = await axiosClient.patch(`/product-options/${id}/status`, {
      isActive,
    });
    return res.data;
  },

  // Xóa
  remove: async (id: number): Promise<void> => {
    await axiosClient.delete(`/product-options/${id}`);
  },

  // Lấy tất cả variant theo productId
  getByProductId: async (proId: number): Promise<ProductVariant[]> => {
    const res = await axiosClient.get(`/product-options/product/${proId}`);
    return res.data;
  },

  getProductByOptionId: async (
    optionId: number,
  ): Promise<ProductVariantProduct> => {
    const res = await axiosClient.get(`/product-options/${optionId}/product`);
    return res.data;
  },
  // Cập nhật số lượng tồn kho
  updateStock: async (
    id: number,
    quantityAdjustment: number,
  ): Promise<ProductVariant> => {
    const res = await axiosClient.patch(`/product-options/${id}/stock`, {
      quantityAdjustment,
    });
    return res.data;
  },
};
