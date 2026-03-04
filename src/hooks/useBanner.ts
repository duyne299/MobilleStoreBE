import { useState, useEffect, useCallback } from "react";
import { bannerService, Banner } from "../services/bannerService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useBanners(initialLimit = 10) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // --- Fetch banners ---
  const fetchBanners = useCallback(
    async ({
      page = 1,
      limit = initialLimit,
      search = "",
    }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await bannerService.getAll({ page, limit, search });
        setBanners(res.data);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải banner");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  // --- Search banners ---
  const searchBanners = useCallback(
    (keyword: string) => {
      setSearch(keyword);
      fetchBanners({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchBanners, initialLimit]
  );

  // --- Chuyển page ---
  const nextPage = useCallback(
    (page: number) => {
      fetchBanners({ page, limit: initialLimit, search });
    },
    [fetchBanners, initialLimit, search]
  );

  // --- Tạo banner (có upload file) ---
  const createBanner = useCallback(
    async (data: FormData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await bannerService.create(data);
        setBanners((prev) => [res, ...prev]);
        setTotal((prev) => prev + 1);
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi tạo banner");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Cập nhật banner ---
  const updateBanner = useCallback(
    async (id: number, data: FormData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await bannerService.update(id, data);
        setBanners((prev) =>
          prev.map((b) => (b.bannerId === id ? res : b))
        );
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật banner");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Cập nhật trạng thái ---
  const updateBannerStatus = useCallback(
    async (id: number, isActive: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await bannerService.updateStatus(id, isActive);
        setBanners((prev) =>
          prev.map((b) => (b.bannerId === id ? res : b))
        );
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật trạng thái banner");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Xóa banner ---
  const deleteBanner = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        await bannerService.remove(id);
        setBanners((prev) => prev.filter((b) => b.bannerId !== id));
        setTotal((prev) => prev - 1);
      } catch (err: any) {
        setError(err.message || "Lỗi xóa banner");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Lấy chi tiết banner ---
  const getBanner = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bannerService.getOne(id);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi lấy chi tiết banner");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners({ page: 1, limit: initialLimit });
  }, [fetchBanners, initialLimit]);

  return {
    banners,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchBanners,
    searchBanners,
    nextPage,
    createBanner,
    updateBanner,
    updateBannerStatus,
    deleteBanner,
    getBanner,
  };
}
