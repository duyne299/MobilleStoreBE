import { useState, useEffect, useCallback } from "react";
import { orderService, Order, OrderDetail } from "../services/orderService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  orderType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useOrders(initialLimit = 10) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [orderType, setOrderType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // --- Fetch orders với pagination + search + filter ---
  const fetchOrders = useCallback(
    async ({
      page = 1,
      limit = initialLimit,
      search = "",
      status = "all",
      orderType = "all",
      dateFrom = "",
      dateTo = "",
    }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.findAll({
          page,
          limit,
          search,
          status: status !== "all" ? status : undefined,
          orderType: orderType !== "all" ? orderType : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });
        setOrders(res.orders);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  // --- Search orders with all current filters ---
  const searchOrders = useCallback(
    async (keyword: string, additionalParams?: Partial<FetchParams>) => {
      setSearch(keyword);
      await fetchOrders({ 
        page: 1, 
        limit: initialLimit, 
        search: keyword,
        status,
        orderType,
        dateFrom,
        dateTo,
        ...additionalParams
      });
    },
    [fetchOrders, initialLimit, status, orderType, dateFrom, dateTo]
  );

  // --- Apply filters ---
  const applyFilters = useCallback(
    async (filters: Partial<FetchParams>) => {
      if (filters.status !== undefined) setStatus(filters.status);
      if (filters.orderType !== undefined) setOrderType(filters.orderType);
      if (filters.dateFrom !== undefined) setDateFrom(filters.dateFrom);
      if (filters.dateTo !== undefined) setDateTo(filters.dateTo);

      await fetchOrders({
        page: 1,
        limit: initialLimit,
        search,
        ...filters,
      });
    },
    [fetchOrders, initialLimit, search]
  );

  // --- Reset filters ---
  const resetFilters = useCallback(async () => {
    setStatus("all");
    setOrderType("all");
    setDateFrom("");
    setDateTo("");
    await fetchOrders({
      page: 1,
      limit: initialLimit,
      search,
      status: "all",
      orderType: "all",
      dateFrom: "",
      dateTo: "",
    });
  }, [fetchOrders, initialLimit, search]);

  // --- Chuyển page ---
  const nextPage = useCallback(
    async (page: number) => {
      await fetchOrders({ 
        page, 
        limit: initialLimit, 
        search,
        status,
        orderType,
        dateFrom,
        dateTo,
      });
    },
    [fetchOrders, initialLimit, search, status, orderType, dateFrom, dateTo]
  );

  // --- Tạo đơn hàng mới ---
  const createOrder = useCallback(async (data: Partial<Order>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.create(data);
      setOrders((prev) => [res, ...prev]);
      setTotal((prev) => prev + 1);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tạo đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy chi tiết đơn hàng theo id ---
  const getOrder = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.findOne(id);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi lấy chi tiết đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Cập nhật trạng thái đơn hàng ---
  const updateOrderStatus = useCallback(
    async (id: number, data: Partial<Order>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.updateStatus(id, data);
        setOrders((prev) =>
          prev.map((order) => (order.orderId === id ? res : order))
        );
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật trạng thái đơn hàng");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Xóa đơn hàng ---
  const deleteOrder = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.remove(id);
      setOrders((prev) => prev.filter((order) => order.orderId !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      setError(err.message || "Lỗi xóa đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy số lượng đã bán theo sản phẩm ---
  const getSoldQuantityByProduct = useCallback(async (productId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getSoldQuantityByProduct(productId);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi lấy số lượng đã bán");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== ORDER DETAIL =====

  // --- Tạo order detail ---
  const createOrderDetail = useCallback(async (data: Partial<OrderDetail>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.createOrderDetail(data);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tạo chi tiết đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy tất cả order details ---
  const getAllOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.findAllOrderDetails();
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi lấy danh sách chi tiết đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy order details theo orderId ---
  const getOrderDetailsByOrder = useCallback(
    async (orderId: number, params: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.findOrderDetailsByOrder(orderId, params);
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi lấy chi tiết đơn hàng");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getProductByOptionId = useCallback(async (optionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getProductByOptionId(optionId);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi lấy thông tin sản phẩm");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders({ page: 1, limit: initialLimit });
  }, [fetchOrders, initialLimit]);

  return {
    // State
    orders,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    status,
    orderType,
    dateFrom,
    dateTo,

    // Order methods
    fetchOrders,
    searchOrders,
    applyFilters,
    resetFilters,
    nextPage,
    createOrder,
    getOrder,
    updateOrderStatus,
    deleteOrder,
    getSoldQuantityByProduct,

    // OrderDetail methods
    createOrderDetail,
    getAllOrderDetails,
    getOrderDetailsByOrder,
    getProductByOptionId,
  };
}