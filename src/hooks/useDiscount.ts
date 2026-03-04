import { useState, useEffect, useCallback } from "react";
import { discountService, Discount } from "../services/discountService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useDiscounts(initialLimit = 10) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // --- Fetch discount với pagination + search ---
  const fetchDiscounts = useCallback(
    async ({
      page = 1,
      limit = initialLimit,
      search = "",
    }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await discountService.getAll({ page, limit, search });
        setDiscounts(res.data);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải mã giảm giá");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  // --- Search discount ---
  const searchDiscounts = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      fetchDiscounts({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchDiscounts, initialLimit]
  );

  // --- Chuyển page ---
  const nextPage = useCallback(
    (page: number) => {
      fetchDiscounts({ page, limit: initialLimit, search });
    },
    [fetchDiscounts, initialLimit, search]
  );

  // --- Tạo discount ---
  const createDiscount = useCallback(async (data: Partial<Discount>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await discountService.create(data);
      setDiscounts((prev) => [res, ...prev]);
      setTotal((prev) => prev + 1);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tạo mã giảm giá");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Cập nhật discount ---
  const updateDiscount = useCallback(
    async (id: number, data: Partial<Discount>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await discountService.update(id, data);
        setDiscounts((prev) =>
          prev.map((d) => (d.discountId === id ? res : d))
        );
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật mã giảm giá");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Xóa discount ---
  const deleteDiscount = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await discountService.remove(id);
      setDiscounts((prev) => prev.filter((d) => d.discountId !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      setError(err.message || "Lỗi xóa mã giảm giá");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Áp dụng mã giảm giá ---
  const applyDiscount = useCallback(
    async (code: string, totalAmount: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await discountService.apply(code, totalAmount);
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi áp dụng mã giảm giá");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateDiscountStatus = useCallback(
    async (id: number, isActive: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await discountService.updateStatus(id, isActive);
        setDiscounts((prev) => prev.map((d) => (d.discountId === id ? res : d)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật trạng thái");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDiscounts({ page: 1, limit: initialLimit });
  }, [fetchDiscounts, initialLimit]);

  return {
    discounts,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchDiscounts,
    searchDiscounts,
    nextPage,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    updateDiscountStatus,
    applyDiscount,
  };
}
