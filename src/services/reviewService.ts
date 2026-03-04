import axiosClient from "@/lib/axiosClient";
import { User } from "@/services/userService";

export interface ReviewImage {
  imageId: number;
  imageUrl: string;
} 

export interface Review {
  reviewId: number;
  proId: number;
  parentId: number;
  user: User;
  replies: Review[];
  images: ReviewImage[];
  rating: number; // 0 = comment, 1-5 = review
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export const reviewService = {
  /* GET /reviews/product/:proId */
  getByProduct: async (proId: number) => {
    const res = await axiosClient.get(`/reviews/product/${proId}`);
    return res.data as Review[];
  },

  /* GET /reviews/rating/:proId */
  getRating: async (proId: number) => {
    const res = await axiosClient.get(`/reviews/rating/${proId}`);
    return res.data; // { proId, avgRating, totalReviews }
  },

  /* GET /reviews/check-purchase/:proId */
  checkPurchase: async (proId: number) => {
    const res = await axiosClient.get(`/reviews/check-purchase/${proId}`);
    return res.data as { hasPurchased: boolean };
  },

  /* POST /reviews */
  create: async (data: Partial<Review>, files?: File[]) => {
    const form = new FormData();

    // ✅ Chỉ gửi proId, comment, rating (userId lấy từ JWT)
    form.append("proId", String(data.proId));
    form.append("comment", data.comment || "");
    form.append("rating", String(data.rating ?? 0));

    if (data.parentId) {
      form.append("parentId", String(data.parentId));
    }

    // ✅ Gửi files dưới tên "images" (khớp với @UseInterceptors)
    if (files && files.length > 0) {
      files.forEach((file) => form.append("images", file));
    }

    const res = await axiosClient.post("/reviews", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  /* PUT /reviews/:id */
  update: async (id: number, data: Partial<Review>, files?: File[]) => {
    const form = new FormData();

    // ✅ Chỉ gửi các field cần update
    if (data.comment !== undefined) {
      form.append("comment", data.comment);
    }

    if (data.rating !== undefined) {
      form.append("rating", String(data.rating));
    }

    // ✅ Gửi files dưới tên "images"
    if (files && files.length > 0) {
      files.forEach((file) => form.append("images", file));
    }

    const res = await axiosClient.put(`/reviews/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  /* DELETE /reviews/:id */
  remove: async (id: number) => {
    const res = await axiosClient.delete(`/reviews/${id}`);
    return res.data;
  },
};
