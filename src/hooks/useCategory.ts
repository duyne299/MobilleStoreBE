import { useState, useEffect, useCallback } from "react";
import { categoryService, Category } from "../services/categoryService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export function useCategories(initialLimit = 10, initialActive?: boolean) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // --- Fetch category với pagination + search ---
  const fetchCategories = useCallback(
    async ({
      page = 1,
      limit = initialLimit,
      search = "",
      active = initialActive,
    }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await categoryService.getAll({
          page,
          limit,
          search,
          active,
        });
        setCategories(res.data);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải danh mục");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit, initialActive],
  );

  // --- Search category ---
  const searchCategories = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      fetchCategories({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchCategories, initialLimit],
  );

  // --- Chuyển page ---
  const nextPage = useCallback(
    (page: number) => {
      fetchCategories({ page, limit: initialLimit, search });
    },
    [fetchCategories, initialLimit, search],
  );

  // --- Tạo category ---
  const createCategory = useCallback(
    async (data: Partial<Category>, image?: File) => {
      setLoading(true);
      setError(null);
      try {
        const res = await categoryService.create(data, image);
        setCategories((prev) => [res, ...prev]);
        setTotal((prev) => prev + 1);
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi tạo danh mục");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // --- Cập nhật category ---
  const updateCategory = useCallback(
    async (slug: string, data: Partial<Category>, image?: File) => {
      setLoading(true);
      setError(null);
      try {
        const res = await categoryService.update(slug, data, image);
        setCategories((prev) => prev.map((c) => (c.slug === slug ? res : c)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật danh mục");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // --- Cập nhật trạng thái isActive ---
  const updateCategoryStatus = useCallback(
    async (slug: string, isActive: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await categoryService.updateStatus(slug, isActive);
        setCategories((prev) => prev.map((c) => (c.slug === slug ? res : c)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật trạng thái");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // --- Xóa category ---
  const deleteCategory = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await categoryService.remove(id);
      setCategories((prev) => prev.filter((c) => c.categoryId !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      setError(err.message || "Lỗi xóa danh mục");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy chi tiết 1 category theo slug hoặc id ---
  const getCategory = useCallback(async (idOrSlug: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.getOne(idOrSlug);
      return res; // trả về Category
    } catch (err: any) {
      setError(err.message || "Lỗi lấy chi tiết danh mục");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories({ page: 1, limit: initialLimit });
  }, [fetchCategories, initialLimit]);

  return {
    categories,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchCategories,
    searchCategories,
    nextPage,
    createCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    getCategory,
  };
}
