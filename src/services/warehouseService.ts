import { Store } from "@/services/storeService";
import axiosClient from "@/lib/axiosClient";

export interface WarehouseItem {
  warehouseId: number;
  option: {
    optionId: number;
    rom: string | null;
    color: string | null;
    extraPrice: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    product: {
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
    };
  };
  store: Store;
  importPrice: number;
  baseSalePrice: number;
  quantity: number;
  lastImportDate: string;
}

export const warehouseService = {
  // Lấy tất cả warehouse với phân trang/search
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);

    const res = await axiosClient.get<{ data: WarehouseItem[]; total: number }>(
      `/warehouses?${query.toString()}`
    );
    return res.data;
  },

  // Lấy chi tiết warehouse theo id
  getOne: async (warehouseId: number): Promise<WarehouseItem> => {
    const res = await axiosClient.get(`/warehouses/${warehouseId}`);
    return res.data;
  },

  // Nhập kho
  importStock: async (data: {
    optionId: number;
    storeId: number;
    quantity: number;
    importPrice: number;
    baseSalePrice: number;
  }): Promise<WarehouseItem> => {
    const res = await axiosClient.post("/warehouses/import", data);
    return res.data;
  },

  // Cập nhật số lượng
  updateQuantity: async (
    optionId: number,
    storeId: number,
    delta: number
  ): Promise<WarehouseItem> => {
    const res = await axiosClient.patch(
      `/warehouses/${optionId}/update-quantity`,
      {
        storeId,
        delta,
      }
    );
    return res.data;
  },

  // Xóa warehouse
  remove: async (warehouseId: number): Promise<void> => {
    await axiosClient.delete(`/warehouses/${warehouseId}`);
  },

  // Lấy warehouse theo optionId
  getByOptionId: async (optionId: number): Promise<WarehouseItem> => {
    const res = await axiosClient.get(
      `/warehouses/by-option?optionId=${optionId}`
    );
    return res.data;
  },

  getByProductId: async (
    productId: number,
    storeId?: number
  ): Promise<WarehouseItem[]> => {
    const query = new URLSearchParams();
    if (storeId) query.append("storeId", storeId.toString());

    const res = await axiosClient.get<WarehouseItem[]>(
      `/warehouses/product/${productId}/?${query.toString()}`
    );
    return res.data;
  },
};
