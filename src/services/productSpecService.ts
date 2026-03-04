import axiosClient from "@/lib/axiosClient";

export interface ProductSpecification {
  specId: number;
  proId: number;
  os: string;
  display: string;
  cpu: string;
  gpu: string;
  ram: string;
  rom: string;
  cameraFront: string;
  cameraRear: string;
  battery: string;
  weight: string;
  size: string;
  sim: string;
  material: string;
  createdAt: string;
  updatedAt: string;
}

export const productSpecService = {
  // Lấy tất cả product specification
  getAll: async (): Promise<ProductSpecification[]> => {
    const res = await axiosClient.get("/product-specification");
    return res.data;
  },

  // Lấy chi tiết theo id
  getOne: async (id: number): Promise<ProductSpecification> => {
    const res = await axiosClient.get(`/product-specification/${id}`);
    return res.data;
  },

  // Thêm mới
  create: async (data: Partial<ProductSpecification>): Promise<ProductSpecification> => {
    const res = await axiosClient.post("/product-specification", data);
    return res.data;
  },

  // Cập nhật
  update: async (id: number, data: Partial<ProductSpecification>): Promise<ProductSpecification> => {
    const res = await axiosClient.put(`/product-specification/${id}`, data);
    return res.data;
  },

  // Xóa
  remove: async (id: number): Promise<void> => {
    await axiosClient.delete(`/product-specification/${id}`);
  },
};
