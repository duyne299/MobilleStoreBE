import { useState, useEffect, useCallback } from "react";
import {
  productVariantService,
  ProductVariant,
} from "../services/productVariantService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useProductVariants(initialLimit = 10) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // fetch với phân trang và search
  const fetchVariants = useCallback(
    async ({
      page = 1,
      limit = initialLimit,
      search = "",
    }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        // nếu backend trả toàn bộ danh sách, filter/search trên FE
        let data = await productVariantService.getAll();
        if (search) {
          const lowerSearch = search.toLowerCase();
          data = data.filter(
            (v) =>
              v.product.proName.toLowerCase().includes(lowerSearch) ||
              (v.product.description &&
                v.product.description.toLowerCase().includes(lowerSearch))
          );
        }
        const start = (page - 1) * limit;
        const pagedData = data.slice(start, start + limit);

        setVariants(pagedData);
        setTotal(data.length);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải product variants");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  const searchVariants = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      fetchVariants({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchVariants, initialLimit]
  );

  const nextPage = useCallback(
    (page: number) => {
      fetchVariants({ page, limit: initialLimit, search });
    },
    [fetchVariants, initialLimit, search]
  );

  // --- Thêm variant ---
  const createVariant = useCallback(async (data: Partial<ProductVariant>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productVariantService.create(data);
      setVariants((prev) => [res, ...prev]);
      setTotal((prev) => prev + 1);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tạo product variant");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Cập nhật variant ---
  const updateVariant = useCallback(
    async (id: number, data: Partial<ProductVariant>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await productVariantService.update(id, data);
        setVariants((prev) => prev.map((v) => (v.optionId === id ? res : v)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật product variant");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Cập nhật trạng thái isActive ---
  const updateStatus = useCallback(async (id: number, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productVariantService.updateStatus(id, isActive);
      setVariants((prev) => prev.map((v) => (v.optionId === id ? res : v)));
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật trạng thái");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Xóa variant ---
  const removeVariant = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await productVariantService.remove(id);
      setVariants((prev) => prev.filter((v) => v.optionId !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      setError(err.message || "Lỗi xóa product variant");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy variant theo productId ---
  const fetchByProductId = useCallback(
    async (
      proId: number,
      { page = 1, limit = initialLimit, search = "" }: FetchParams = {}
    ) => {
      setLoading(true);
      setError(null);
      try {
        let data = await productVariantService.getByProductId(proId);
        if (search) {
          const lowerSearch = search.toLowerCase();
          data = data.filter(
            (v) =>
              v.product.proName.toLowerCase().includes(lowerSearch) ||
              (v.product.description &&
                v.product.description.toLowerCase().includes(lowerSearch))
          );
        }
        const start = (page - 1) * limit;
        const pagedData = data.slice(start, start + limit);

        setVariants(pagedData);
        setTotal(data.length);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải product variants theo productId");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  const getProductByOptionId = useCallback(async (optionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const product = await productVariantService.getProductByOptionId(
        optionId
      );
      return product;
    } catch (err: any) {
      setError(err.message || "Lỗi tải thông tin product theo optionId");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVariants({ page: 1, limit: initialLimit });
  }, [fetchVariants, initialLimit]);

  return {
    variants,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchVariants,
    searchVariants,
    nextPage,
    createVariant,
    updateVariant,
    updateStatus,
    removeVariant,
    fetchByProductId,
    getProductByOptionId,
    updateStock: async (id: number, quantityAdjustment: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await productVariantService.updateStock(id, quantityAdjustment);
        setVariants((prev) => prev.map((v) => (v.optionId === id ? res : v)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật tồn kho");
        throw err;
      } finally {
        setLoading(false);
      }
    },
  };
}
