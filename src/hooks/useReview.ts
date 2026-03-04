import { useState, useCallback } from "react";
import { reviewService, Review } from "../services/reviewService";

interface FetchParams {
  proId: number;
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch reviews theo productId ---
  const fetchReviews = useCallback(async ({ proId }: FetchParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewService.getByProduct(proId);
      setReviews(res);
    } catch (err: any) {
      setError(err.message || "Lỗi tải đánh giá");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy rating của sản phẩm ---
  const getRating = useCallback(async (proId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewService.getRating(proId);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tải rating");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Kiểm tra đã mua hàng chưa ---
  const checkPurchase = useCallback(async (proId: number) => {
    try {
      const res = await reviewService.checkPurchase(proId);
      return res.hasPurchased;
    } catch (err: any) {
      console.error("Lỗi kiểm tra mua hàng:", err);
      return false;
    }
  }, []);

  // --- Tạo review ---
  const createReview = useCallback(
    async (data: Partial<Review>, files?: File[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await reviewService.create(data, files);
        setReviews((prev) => [res, ...prev]);
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi tạo đánh giá");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Cập nhật review ---
  const updateReview = useCallback(
    async (id: number, data: Partial<Review>, files?: File[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await reviewService.update(id, data, files);
        setReviews((prev) =>
          prev.map((r) => (r.reviewId === id ? res : r))
        );
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật đánh giá");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Xóa review ---
  const deleteReview = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await reviewService.remove(id);
      setReviews((prev) => prev.filter((r) => r.reviewId !== id));
    } catch (err: any) {
      setError(err.message || "Lỗi xóa đánh giá");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    getRating,
    checkPurchase, // Thêm function mới
    createReview,
    updateReview,
    deleteReview,
  };
}