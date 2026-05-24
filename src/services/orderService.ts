import axiosClient from "@/lib/axiosClient";
import { ProductVariant } from "@/services/productVariantService";
import { User } from "@/services/userService";

export interface Order {
  orderId: number;
  orderCode: string;
  user: User;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  shippingFee?: number | null;
  status: string;
  note?: string | null;
  customerAddress: string;
  orderType: "PICKUP" | "DELIVERY";
  transactionCode?: string | null;
  createdAt: string;
  updateAt?: string | null;
  shipping?: any;
  payment?: any;
}

export interface OrderDetail {
  detailId: number;
  order: Order;
  option: ProductVariant;
  quantity: number;
  price: number;
}

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  orderType?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: number;
}

export const orderService = {
  // Tạo đơn hàng mới
  create: async (data: Partial<Order>) => {
    const res = await axiosClient.post("/orders", data);
    return res.data;
  },

  // Lấy danh sách đơn hàng với phân trang/search
  findAll: async (params: FindAllParams) => {
    const res = await axiosClient.get("/orders", { params });
    return res.data;
  },

  // Lấy chi tiết đơn hàng theo id
  findOne: async (id: number) => {
    const res = await axiosClient.get(`/orders/${id}`);
    return res.data;
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (id: number, data: Partial<Order>) => {
    const res = await axiosClient.patch(`/orders/${id}`, data);
    return res.data;
  },

  // Xóa đơn hàng
  remove: async (id: number) => {
    const res = await axiosClient.delete(`/orders/${id}`);
    return res.data;
  },

  // Lấy số lượng đã bán theo sản phẩm
  getSoldQuantityByProduct: async (productId: number) => {
    const res = await axiosClient.get(`/orders/sold-quantity/${productId}`);
    return res.data;
  },

  // ----- OrderDetail API -----

  createOrderDetail: async (data: Partial<OrderDetail>) => {
    const res = await axiosClient.post("/order-detail", data);
    return res.data;
  },

  findAllOrderDetails: async () => {
    const res = await axiosClient.get("/order-detail");
    return res.data;
  },

  findOrderDetailsByOrder: async (
    orderId: number,
    params: FindAllParams = {}
  ) => {
    const res = await axiosClient.get(`/order-detail/order/${orderId}`, {
      params,
    });
    return res.data;
  },

  getProductByOptionId: async (optionId: number) => {
    const res = await axiosClient.get(`/product-options/${optionId}/product`);
    return res.data;
  },
};