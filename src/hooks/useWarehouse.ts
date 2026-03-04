import { useState, useEffect, useCallback } from "react";
import { warehouseService } from "../services/warehouseService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useWarehouses(initialLimit = 10) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // --- fetch items ---
  const fetchItems = useCallback(
    async ({
      page = 1,
      limit = initialLimit,
      search = "",
    }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await warehouseService.getAll({ page, limit, search });
        setItems(res.data);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Failed to load warehouse items");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  // --- search items ---
  const searchItems = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      fetchItems({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchItems, initialLimit]
  );

  // --- pagination ---
  const nextPage = useCallback(
    (page: number) => {
      fetchItems({ page, limit: initialLimit, search });
    },
    [fetchItems, initialLimit, search]
  );

  // --- import stock / add item ---
  const importItem = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await warehouseService.importStock(data);

      setItems((prev) => {
        // Tìm item theo optionId + storeId (chuẩn nhất)
        const index = prev.findIndex(
          (i) =>
            i.option &&
            res.option &&
            i.store &&
            res.store &&
            i.option.optionId === res.option.optionId &&
            i.store.storeId === res.store.storeId
        );

        if (index >= 0) {
          // UPDATE tồn kho
          const newArr = [...prev];
          newArr[index] = res;
          return newArr;
        } else {
          // Thêm item mới vào đầu danh sách
          setTotal((prev) => prev + 1);
          return [res, ...prev];
        }
      });

      return res;
    } catch (err: any) {
      setError(err.message || "Failed to import stock");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByOption = useCallback(async (optionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await warehouseService.getByOptionId(optionId);
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to load warehouse by optionId");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByProduct = useCallback(
    async (productId: number, storeId?: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await warehouseService.getByProductId(productId, storeId);
        return res;
      } catch (err: any) {
        setError(err.message || "Failed to load warehouses by productId");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchItems({ page: 1, limit: initialLimit });
  }, [fetchItems, initialLimit]);

  return {
    items,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchItems,
    searchItems,
    nextPage,
    importItem,
    getByOption,
    getByProduct,
  };
}
