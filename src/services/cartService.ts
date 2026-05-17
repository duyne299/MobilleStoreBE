import axiosClient from "@/lib/axiosClient";

export interface Product {
  proId: number;
  proName: string;
  slug: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  soldCount: number;
}

export interface Option {
  optionId: number;
  rom: string;
  color: string;
  extraPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: Product;
  baseSalePrice?: number;
  quantity?: number;
}

export interface CartItem {
  itemId: number;
  quantity: number;
  isChecked: boolean;
  option: Option;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  total?: number;
}

export interface AddToCartDto {
  optionId: number;
  quantity: number;
}

export const cartService = {
  // Thêm sản phẩm vào giỏ
  addToCart: async (data: AddToCartDto) => {
    const res = await axiosClient.post("/cart/add", data);
    return res.data; // { message: string, cartId: number, total: number }
  },

  // Lấy giỏ hàng hiện tại
  getCart: async () => {
    const res = await axiosClient.get("/cart");
    return res.data; // Cart
  },

  // Cập nhật số lượng sản phẩm
  updateQuantity: async (itemId: number, quantity: number) => {
    const res = await axiosClient.patch(`/cart/${itemId}`, { quantity });
    return res.data; // { message: string, total: number }
  },

  // ✅ Cập nhật trạng thái check của 1 item
  updateItemCheck: async (itemId: number, isChecked: boolean) => {
    const res = await axiosClient.patch(`/cart/${itemId}/check`, { isChecked });
    return res.data; // { message: string, itemId: number, isChecked: boolean }
  },

  // ✅ Cập nhật trạng thái check của tất cả items
  updateAllItemsCheck: async (isChecked: boolean) => {
    const res = await axiosClient.patch("/cart/check-all", { isChecked });
    return res.data; // { message: string, count: number, isChecked: boolean }
  },

  // Xóa sản phẩm khỏi giỏ
  removeItem: async (itemId: number) => {
    const res = await axiosClient.delete(`/cart/${itemId}`);
    return res.data; // { message: string, total: number }
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const res = await axiosClient.delete("/cart");
    return res.data; // { message: string }
  },
};