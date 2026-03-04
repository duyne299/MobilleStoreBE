import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrder';
import OrderDetail from '@/components/profile/OrderDetail';

interface MyOrdersProps {
  onBack: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    icon: Clock
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: CheckCircle
  },
  WAITING_PICKUP: {
    label: 'Chờ lấy hàng',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: Truck
  },
  SHIPPING: {
    label: 'Đang giao',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: Truck
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckCircle
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: XCircle
  }
};

const orderTypeConfig = {
  PICKUP: { label: 'Lấy tại cửa hàng', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  DELIVERY: { label: 'Giao hàng', color: 'text-green-600', bgColor: 'bg-green-50' }
};

export default function MyOrders({ onBack }: MyOrdersProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrderType, setSelectedOrderType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const {
    orders,
    loading,
    error,
    currentPage,
    total,
    limit,
    fetchOrders,
    nextPage
  } = useOrders(10);

  // Lấy userId từ localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUserId(userData.userId);
    }
  }, []);

  // Fetch orders khi có userId
  useEffect(() => {
    if (userId) {
      fetchOrders({ page: 1, limit: 10 });
    }
  }, [userId]);

  // Lọc orders theo userId và các filter khác
  const getFilteredOrders = () => {
    let filtered = orders.filter(order => order.user?.userId === userId);

    // Lọc theo trạng thái
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Lọc theo loại đơn hàng
    if (selectedOrderType !== 'all') {
      filtered = filtered.filter(order => order.orderType === selectedOrderType);
    }

    // Lọc theo tìm kiếm
    if (searchTerm.trim()) {
      filtered = filtered.filter(order =>
        order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const userOrders = getFilteredOrders();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = () => {
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedOrderType('all');
    setSearchTerm('');
    setShowFilters(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Nếu đang xem chi tiết đơn hàng
  if (selectedOrderId) {
    return (
      <OrderDetail
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
      />
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h1>
        <div className="w-24"></div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            <Filter size={20} />
            <span>Lọc</span>
            <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả</option>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại đơn hàng
                    </label>
                    <select
                      value={selectedOrderType}
                      onChange={(e) => setSelectedOrderType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả</option>
                      <option value="PICKUP">Lấy tại cửa hàng</option>
                      <option value="DELIVERY">Giao hàng</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Đặt lại
                  </button>
                  <button
                    onClick={handleFilterChange}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Orders List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-600">
          {error}
        </div>
      )}

      {userOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || selectedStatus !== 'all' || selectedOrderType !== 'all'
              ? 'Không tìm thấy đơn hàng nào phù hợp'
              : 'Bạn chưa có đơn hàng nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;
            const orderTypeInfo = orderTypeConfig[order.orderType];

            return (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-gray-800">
                        #{order.orderCode}
                      </span>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderTypeInfo.bgColor} ${orderTypeInfo.color}`}>
                        {orderTypeInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(order.finalAmount)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Phương thức thanh toán:</span>
                    <span className="font-medium">{order.paymentMethod}</span>
                  </div>
                  {order.shippingFee === 0 ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                        Miễn phí
                      </span>
                    </div>
                  ) : (
                    order.shippingFee && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                      </div>
                    )
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Địa chỉ giao hàng:</span>
                    <span className="font-medium text-right max-w-xs truncate">
                      {order.customerAddress}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => setSelectedOrderId(order.orderId)}
                    className="px-4 py-2 text-blue-600 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Chi tiết
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}