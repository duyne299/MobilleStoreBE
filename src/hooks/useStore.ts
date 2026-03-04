import { useState, useEffect, useCallback } from "react";
import { storeService, Store } from "../services/storeService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useStores(initialLimit = 10) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // --- Fetch store với pagination + search ---
  const fetchStores = useCallback(
    async ({
      page = 1,
      limit = initialLimit,
      search = "",
    }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await storeService.getAll({ page, limit, search });
        setStores(res.data);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải danh sách cửa hàng");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  // --- Search store ---
  const searchStores = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      fetchStores({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchStores, initialLimit]
  );

  // --- Chuyển trang ---
  const nextPage = useCallback(
    (page: number) => {
      fetchStores({ page, limit: initialLimit, search });
    },
    [fetchStores, initialLimit, search]
  );

  // --- Tạo store ---
  const createStore = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeService.create(data);
      setStores((prev) => [res, ...prev]);
      setTotal((prev) => prev + 1);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tạo cửa hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Cập nhật store ---
  const updateStore = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeService.update(id, data);
      setStores((prev) => prev.map((s) => (s.storeId === id ? res : s)));
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật cửa hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Xóa store ---
  const deleteStore = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await storeService.remove(id);
      setStores((prev) => prev.filter((s) => s.storeId !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      setError(err.message || "Lỗi xóa cửa hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Update trạng thái isActive ---
  const updateStoreStatus = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeService.toggleStatus(id);

      // update trạng thái trong danh sách
      setStores((prev) => prev.map((s) => (s.storeId === id ? res : s)));

      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi đổi trạng thái cửa hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load lần đầu
  useEffect(() => {
    fetchStores({ page: 1, limit: initialLimit });
  }, [fetchStores, initialLimit]);

  return {
    stores,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchStores,
    searchStores,
    nextPage,
    createStore,
    updateStore,
    deleteStore,
    updateStoreStatus,
  };
}
