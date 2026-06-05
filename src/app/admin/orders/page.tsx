"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  X,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import ConfirmToast from "@/components/ui/ConfirmToast";
import { useOrders } from "@/hooks/useOrder";
import * as XLSX from "xlsx";

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "WAITING_PICKUP", label: "Chờ lấy hàng" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const ORDER_TYPE_FILTERS = [
  { value: "all", label: "Tất cả loại" },
  { value: "PICKUP", label: "Đến lấy" },
  { value: "DELIVERY", label: "Giao hàng" },
];

export default function OrderManagement() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    orderId?: number;
    orderCode?: string;
  }>({ show: false });

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const {
    orders,
    loading,
    error,
    currentPage,
    total,
    limit,
    searchOrders,
    nextPage,
    deleteOrder,
    applyFilters,
    resetFilters,
    updateOrderStatus,
  } = useOrders(10);

  const { orders: orders2 } = useOrders(100000);

  const totalPages = Math.ceil(total / limit);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        handleApplyFilters();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleApplyFilters = async () => {
    await applyFilters({
      search: searchTerm,
      status: statusFilter,
      orderType: orderTypeFilter,
      dateFrom: dateFromFilter,
      dateTo: dateToFilter,
      page: 1,
      limit,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCancelDelete = () => setConfirmDelete({ show: false });

  const handleConfirmDelete = async () => {
    if (!confirmDelete.orderId) return;
    try {
      await deleteOrder(confirmDelete.orderId);
      showToast("success", `Xóa đơn hàng thành công!`);
      await handleApplyFilters();
    } catch (err: any) {
      showToast(
        "error",
        err.response?.data?.message || err.message || `Xóa đơn hàng thất bại!`,
      );
    } finally {
      setConfirmDelete({ show: false });
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  const handleResetFilters = async () => {
    setStatusFilter("all");
    setOrderTypeFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setSearchTerm("");
    await resetFilters();
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    orderTypeFilter !== "all" ||
    dateFromFilter !== "" ||
    dateToFilter !== "" ||
    searchTerm !== "";

  // Xuất Excel
  const exportToExcel = async () => {
    try {
      const dataToExport = orders2.map((order: any, idx: number) => ({
        STT: idx + 1,
        "Mã đơn hàng": order.orderCode || order.orderId,
        "Mã giao dịch": order.transactionCode || "—",
        "Khách hàng": order.user?.fullName || "—",
        "Tổng tiền": new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(order.totalAmount || 0),
        "Trạng thái": getStatusLabel(order.status),
        "Loại đơn hàng": getOrderTypeLabel(order.orderType),
        "Ngày tạo": new Date(order.createdAt).toLocaleDateString("vi-VN"),
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Đơn hàng");

      const fileName = `don-hang-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showToast("success", "Xuất file Excel thành công!");
    } catch (error) {
      showToast("error", "Xuất file Excel thất bại!");
    }
  };

  const getStatusLabel = (status: string) => {
    const found = STATUS_FILTERS.find((s) => s.value === status);
    return found ? found.label : status;
  };

  const getOrderTypeLabel = (type: string) => {
    const found = ORDER_TYPE_FILTERS.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "WAITING_PICKUP":
        return "bg-orange-100 text-orange-700";
      case "SHIPPING":
        return "bg-purple-100 text-purple-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const generatePages = (
    totalPages: number,
    currentPage: number,
  ): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex gap-2 text-sm text-gray-500 mb-3">
            <Link
              href={"/admin"}
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-800">Quản lý đơn hàng</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        </motion.header>

        {/* ACTIONS */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 suppressHydrationWarning">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
              Lọc đơn hàng
              {hasActiveFilters && (
                <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  !
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
              onClick={exportToExcel}
              disabled={orders.length === 0}
            >
              <Download className="w-5 h-5" />
              Xuất Excel
            </motion.button>
          </div>

          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, khách hàng..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* FILTERS PANEL */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bộ lọc nâng cao
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Lọc theo trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc theo loại đơn hàng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại đơn hàng
                </label>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ORDER_TYPE_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Từ ngày */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Đến ngày */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Tìm thấy{" "}
                <span className="font-semibold text-blue-600">{total}</span> đơn
                hàng
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApplyFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Áp dụng bộ lọc
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-500">Đang tải đơn hàng...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-2">Không tìm thấy đơn hàng</p>
                <p className="text-sm">Thử điều chỉnh bộ lọc hoặc tìm kiếm</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      STT
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Mã đơn hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Mã giao dịch
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Khách hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Trạng thái
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Loại đơn hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {orders.map((order: any, idx: number) => (
                    <motion.tr
                      key={order.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: "#F9FAFB" }}
                      className="transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {(currentPage - 1) * limit + idx + 1}
                      </td>

                      <td className="px-4 py-4 min-w-[120px]">
                        <span className="text-sm font-medium text-blue-600">
                          {order.orderCode || `#${order.orderId}`}
                        </span>
                      </td>

                      <td className="px-4 py-4 min-w-[120px]">
                        <span className="text-sm font-medium text-gray-600 font-mono">
                          {order.transactionCode || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-4 min-w-[150px]">
                        <span className="text-sm text-gray-900">
                          {order.user?.fullName || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.finalAmount || 0)}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await updateOrderStatus(order.orderId, {
                                status: newStatus,
                              });
                              showToast(
                                "success",
                                `Cập nhật trạng thái đơn hàng #${order.orderCode || order.orderId} thành công!`,
                              );
                              order.status = newStatus;
                            } catch (err: any) {
                              showToast(
                                "error",
                                err.message || "Cập nhật trạng thái thất bại",
                              );
                            }
                          }}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent cursor-pointer ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {STATUS_FILTERS.filter((f) => f.value !== "all").map(
                            (status) => (
                              <option
                                key={status.value}
                                value={status.value}
                                className="bg-white text-gray-800 font-normal"
                              >
                                {status.label}
                              </option>
                            ),
                          )}
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {getOrderTypeLabel(order.orderType)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/orders/${order.orderId}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              setConfirmDelete({
                                show: true,
                                orderId: order.orderId,
                                orderCode:
                                  order.orderCode || `#${order.orderId}`,
                              })
                            }
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* PAGINATION */}
        {!loading && orders.length > 0 && (
          <div className="mt-4 flex items-center justify-between px-4 py-4">
            <span className="text-sm text-gray-600">
              Hiển thị {(currentPage - 1) * limit + 1} đến{" "}
              {Math.min(currentPage * limit, total)} của {total} kết quả
            </span>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nextPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              {generatePages(totalPages, currentPage).map((p, index) => (
                <React.Fragment key={index}>
                  {p === "..." ? (
                    <span className="px-2">...</span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => nextPage(p)}
                      className={`w-10 h-10 rounded-lg ${
                        p === currentPage
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </motion.button>
                  )}
                </React.Fragment>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nextPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
      <ConfirmToast
        show={confirmDelete.show}
        message={`Bạn có chắc chắn muốn xóa đơn hàng "${confirmDelete.orderCode}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <Toast toast={toast} />
    </div>
  );
}
