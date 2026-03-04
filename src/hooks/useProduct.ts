  import { useState, useEffect, useCallback, use } from "react";
  import { productService } from "../services/productService";
  import { useWarehouses } from "./useWarehouse";
  import { useOrders } from "@/hooks/useOrder";
  import { useReviews } from "@/hooks/useReview";

  interface FetchParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
  }

  export function useProducts(initialLimit = 10) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");

    const { getByProduct } = useWarehouses();
    const { getSoldQuantityByProduct } = useOrders();
    const { getRating } = useReviews();

    // fetch sản phẩm + preload totalQuantity + soldQuantity
    const fetchProducts = useCallback(
      async ({
        page = 1,
        limit = initialLimit,
        search = "",
      }: FetchParams = {}) => {
        setLoading(true);
        setError(null);
        try {
          const res = await productService.getAll({ page, limit, search });
          // --- preload tổng số lượng warehouse + số lượng đã bán cho từng product ---
          const productsWithTotal = await Promise.all(
            res.data.map(async (p: any) => {
              if (!p.proId)
                return {
                  ...p,
                  totalQuantity: 0,
                  soldQuantity: 0,
                };

              // Lấy tổng số lượng trong kho
              const warehouseItems = await getByProduct(p.proId);
              const totalQuantity = warehouseItems.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              );
              // Lấy số lượng đã bán
              let soldQuantity = 0;
              try {
                const soldData = await getSoldQuantityByProduct(p.proId);
                soldQuantity = soldData?.soldQuantity
                  ? parseInt(soldData.soldQuantity)
                  : 0;
              } catch (err) {
                soldQuantity = 0;
              }
              // Lấy rating và total reviews
              let rating = 0;
              let totalReviews = 0;
              try {
                const ratingData = await getRating(p.proId);
                rating = ratingData?.avgRating || 0;
                totalReviews = ratingData?.totalReviews || 0;
              } catch (err) {
                rating = 0;
                totalReviews = 0;
              }

              return {
                ...p,
                totalQuantity,
                soldQuantity,
                rating,
                totalReviews,
              };
            })
          );

          setProducts(productsWithTotal);
          setTotal(res.total);
          setCurrentPage(page);
        } catch (err: any) {
          setError(err.message || "Lỗi tải sản phẩm");
        } finally {
          setLoading(false);
        }
      },
      [initialLimit, getByProduct, getSoldQuantityByProduct]
    );

    // search sản phẩm
    const searchProducts = useCallback(
      async (keyword: string) => {
        setSearch(keyword);
        fetchProducts({ page: 1, limit: initialLimit, search: keyword });
      },
      [fetchProducts, initialLimit]
    );

    // khi đổi page
    const nextPage = useCallback(
      (page: number) => {
        fetchProducts({ page, limit: initialLimit, search });
      },
      [fetchProducts, initialLimit, search]
    );

    const getProductBySlug = useCallback(
      async (slug: string) => {
        setLoading(true);
        setError(null);
        try {
          const res = await productService.getBySlug(slug);

          // Nếu không có proId, trả về sản phẩm với giá trị mặc định
          if (!res.proId) {
            return {
              ...res,
              totalQuantity: 0,
              soldQuantity: 0,
              rating: 0,
              totalReviews: 0,
            };
          }

          // Lấy tổng số lượng trong kho
          const warehouseItems = await getByProduct(res.proId);
          const totalQuantity = warehouseItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );

          // Lấy số lượng đã bán
          let soldQuantity = 0;
          try {
            const soldData = await getSoldQuantityByProduct(res.proId);
            soldQuantity = soldData?.soldQuantity
              ? parseInt(soldData.soldQuantity)
              : 0;
          } catch {
            soldQuantity = 0;
          }

          // Lấy rating và tổng reviews
          let rating = 0;
          let totalReviews = 0;
          try {
            const ratingData = await getRating(res.proId);
            rating = ratingData?.avgRating || 0;
            totalReviews = ratingData?.totalReviews || 0;
          } catch {
            rating = 0;
            totalReviews = 0;
          }

          return {
            ...res,
            totalQuantity,
            soldQuantity,
            rating,
            totalReviews,
          };
        } catch (err: any) {
          setError(err.message || "Lỗi tải sản phẩm");
          throw err;
        } finally {
          setLoading(false);
        }
      },
      [getByProduct, getSoldQuantityByProduct, getRating]
    );

    const createProduct = useCallback(async (data: any, files?: File[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.create(data, files);
        setProducts((prev) => [res, ...prev]);
        setTotal((prev) => prev + 1);
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi tạo sản phẩm");
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

    const updateProduct = useCallback(
      async (slug: string, data: any, files?: File[]) => {
        setLoading(true);
        setError(null);
        try {
          const res = await productService.update(slug, data, files);
          setProducts((prev) => prev.map((p) => (p.slug === slug ? res : p)));
          return res;
        } catch (err: any) {
          setError(err.message || "Lỗi cập nhật sản phẩm");
          throw err;
        } finally {
          setLoading(false);
        }
      },
      []
    );

    const deleteProduct = useCallback(async (proId: number) => {
      setLoading(true);
      setError(null);
      try {
        await productService.remove(proId);
        setProducts((prev) =>
          prev.map((p) => (p.proId === proId ? { ...p, isDeleted: true } : p))
        );
        setTotal((prev) => prev - 1);
      } catch (err: any) {
        setError(err.message || "Lỗi xóa sản phẩm");
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

    const changeProductStatus = useCallback(
      async (proId: number, isActive: boolean) => {
        setLoading(true);
        setError(null);
        try {
          const res = await productService.changeStatus(proId, isActive);

          // cập nhật state products
          setProducts((prev) =>
            prev.map((p) =>
              p.proId === proId ? { ...p, isActive: res.isActive } : p
            )
          );

          return res;
        } catch (err: any) {
          setError(err.message || "Lỗi thay đổi trạng thái sản phẩm");
          throw err;
        } finally {
          setLoading(false);
        }
      },
      []
    );

    const getByCategoryId = useCallback(
      async (categoryId: number) => {
        setLoading(true);
        setError(null);
        try {
          const res = await productService.getByCategoryId(categoryId);

          // --- preload tổng số lượng warehouse + số lượng đã bán + rating ---
          const productsWithTotal = await Promise.all(
            res.data.map(async (p: any) => {
              if (!p.proId) {
                return {
                  ...p,
                  totalQuantity: 0,
                  soldQuantity: 0,
                  rating: 0,
                  totalReviews: 0,
                };
              }

              // Tổng số lượng trong kho
              const warehouseItems = await getByProduct(p.proId);
              const totalQuantity = warehouseItems.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              );

              // Số lượng đã bán
              let soldQuantity = 0;
              try {
                const soldData = await getSoldQuantityByProduct(p.proId);
                soldQuantity = soldData?.soldQuantity
                  ? parseInt(soldData.soldQuantity)
                  : 0;
              } catch {
                soldQuantity = 0;
              }

              // Rating và tổng reviews
              let rating = 0;
              let totalReviews = 0;
              try {
                const ratingData = await getRating(p.proId);
                rating = ratingData?.avgRating || 0;
                totalReviews = ratingData?.totalReviews || 0;
              } catch {
                rating = 0;
                totalReviews = 0;
              }

              return {
                ...p,
                totalQuantity,
                soldQuantity,
                rating,
                totalReviews,
              };
            })
          );

          return productsWithTotal;
        } catch (err: any) {
          setError(err.message || "Lỗi tải sản phẩm theo danh mục");
          throw err;
        } finally {
          setLoading(false);
        }
      },
      [getByProduct, getSoldQuantityByProduct, getRating]
    );

    useEffect(() => {
      fetchProducts({ page: 1, limit: initialLimit });
    }, [fetchProducts, initialLimit]);

    return {
      products,
      loading,
      error,
      currentPage,
      total,
      limit: initialLimit,
      search,
      fetchProducts,
      searchProducts,
      nextPage,
      createProduct,
      updateProduct,
      deleteProduct,
      getProductBySlug,
      changeProductStatus,
      getByCategoryId,
    };
  }
