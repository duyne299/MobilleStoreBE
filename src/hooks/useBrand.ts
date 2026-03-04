import { useState, useEffect, useCallback } from "react";
import { brandService, Brand } from "../services/brandService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useBrands(initialLimit = 10) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // --- Fetch brand với pagination + search ---
  const fetchBrands = useCallback(
    async ({
      page = 1,
      limit = initialLimit,
      search = "",
    }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await brandService.findAll({ page, limit, search });
        setBrands(res.data);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải thương hiệu");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  // --- Search brand ---
  const searchBrands = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      fetchBrands({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchBrands, initialLimit]
  );

  // --- Chuyển page ---
  const nextPage = useCallback(
    (page: number) => {
      fetchBrands({ page, limit: initialLimit, search });
    },
    [fetchBrands, initialLimit, search]
  );

  // --- Tạo brand mới ---
  const createBrand = useCallback(async (data: any, file?: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("brandName", data.brandName);
      formData.append("slug", data.slug);
      if (file) formData.append("brandLogo", file);
      if (typeof data.isActive === "boolean")
        formData.append("isActive", String(data.isActive));

      const res = await brandService.create(formData);
      setBrands((prev) => [res, ...prev]);
      setTotal((prev) => prev + 1);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tạo thương hiệu");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Cập nhật brand ---
  const updateBrand = useCallback(
    async (idOrSlug: string | number, data: any, file?: File) => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        if (data.brandName) formData.append("brandName", data.brandName);
        if (data.slug) formData.append("slug", data.slug);
        if (typeof data.isActive === "boolean")
          formData.append("isActive", String(data.isActive));
        if (file) formData.append("brandLogo", file);

        const res =
          typeof idOrSlug === "number"
            ? await brandService.update(idOrSlug, data)
            : await brandService.updateStatus(idOrSlug, data.isActive);

        // Cập nhật trong danh sách
        setBrands((prev) =>
          prev.map((b) =>
            b.brandId === res.brandId || b.slug === res.slug ? res : b
          )
        );

        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật thương hiệu");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Xóa brand ---
  const deleteBrand = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await brandService.remove(id);
      setBrands((prev) => prev.filter((b) => b.brandId !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      setError(err.message || "Lỗi xóa thương hiệu");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Update trạng thái isActive theo slug ---
  const updateBrandStatus = useCallback(
    async (slug: string, isActive: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await brandService.updateStatus(slug, isActive);
        setBrands((prev) => prev.map((b) => (b.slug === slug ? res : b)));
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
    fetchBrands({ page: 1, limit: initialLimit });
  }, [fetchBrands, initialLimit]);

  return {
    brands,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchBrands,
    searchBrands,
    nextPage,
    createBrand,
    updateBrand,
    deleteBrand,
    updateBrandStatus,
  };
}
