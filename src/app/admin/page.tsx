"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, TooltipProps, BarChart, Bar } from 'recharts';
import { Star, CreditCard, ShoppingCart, Users } from 'lucide-react';
import { useProducts } from '@/hooks/useProduct';
import { useUsers } from '@/hooks/useUser';
import { useOrders } from '@/hooks/useOrder';

type TimeRange = 'Ngày' | 'Tuần' | 'Tháng';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('Ngày');
  const [selectedYear, setSelectedYear] = useState('2024');

  const { products, loading: productsLoading } = useProducts(100);
  const { users, loading: usersLoading } = useUsers(100);
  const { orders, loading: ordersLoading } = useOrders(1000);

  // Tính toán average rating từ products

  const totalReviews = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.totalReviews || 0), 0);
  }, [products]);

  const averageRating = useMemo(() => {
    const totalRating = products.reduce((sum, p) => sum + ((p.rating || 0) * (p.totalReviews || 0)), 0);
    return totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';
  }, [products, totalReviews]);

  // Tính tổng doanh thu tháng hiện tại
  const currentMonthRevenue = useMemo(() => {
    if (!orders.length) return 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear &&
          order.status === 'COMPLETED';
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [orders]);
  // Tính tổng doanh thu tháng tháng trước
  const lastMonthRevenue = useMemo(() => {
    if (!orders.length) return 0;
    const now = new Date();
    const lastMonth = now.getMonth() - 2;
    const lastMonthYear = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const adjustedLastMonth = lastMonth < 0 ? 11 : lastMonth;
    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === adjustedLastMonth &&
          orderDate.getFullYear() === lastMonthYear &&
          order.status === 'COMPLETED';
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [orders]);
  // Tính % thay đổi doanh thu
  const revenueChange = useMemo(() => {
    if (lastMonthRevenue === 0) return currentMonthRevenue > 0 ? 100 : 0;
    return ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  }, [currentMonthRevenue, lastMonthRevenue]);

  // Tính tổng đơn hàng tháng hiện tại
  const currentMonthOrders = useMemo(() => {
    if (!orders.length) return 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear &&
        order.status === 'COMPLETED';
    }).length;
  }, [orders]);
  // Tính tổng đơn hàng tháng trước
  const lastMonthOrders = useMemo(() => {
    if (!orders.length) return 0;
    const now = new Date();
    const lastMonth = now.getMonth() - 1;
    const lastMonthYear = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const adjustedLastMonth = lastMonth < 0 ? 11 : lastMonth;
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === adjustedLastMonth &&
        orderDate.getFullYear() === lastMonthYear &&
        order.status === 'COMPLETED';
    }).length;
  }, [orders]);
  // Tính % thay đổi đơn hàng
  const ordersChange = useMemo(() => {
    if (lastMonthOrders === 0) return currentMonthOrders > 0 ? 100 : 0;
    return ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;
  }, [currentMonthOrders, lastMonthOrders]);

  const orderStatusData = useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status || 'PENDING';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const colorMap: Record<string, string> = {
      'PENDING': '#F59E0B',
      'CONFIRMED': '#8B5CF6',
      'WAITING_PICKUP': '#3B82F6',
      'SHIPPING': '#F97316',
      'COMPLETED': '#10B981',
      'CANCELLED': '#EF4444'
    };
    const statusLabelMap: Record<string, string> = {
      'PENDING': 'Đang chờ',
      'CONFIRMED': 'Đã xác nhận',
      'WAITING_PICKUP': 'Chờ lấy hàng',
      'SHIPPING': 'Đang vận chuyển',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return Object.entries(statusCounts).map(([statusKey, value]) => ({
      name: statusLabelMap[statusKey] || statusKey,
      value,
      color: colorMap[statusKey] || '#6B7280'
    }));
  }, [orders]);

  // Dữ liệu doanh thu theo thời gian
  const revenueData = useMemo(() => {
    if (!orders.length) return { Ngày: [], Tuần: [], Tháng: [] };
    const dayNumbers = [1, 4, 8, 11, 22];
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const dayData = dayNumbers.map(dayNum => {
      const startDate = new Date(year, month, dayNum, 0, 0, 0);
      const endDate = new Date(year, month, dayNum, 23, 59, 59);
      const revenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate && order.status === 'COMPLETED';
        })
        .reduce((sum, order) => sum + (order.finalAmount || 0), 0);
      return {
        day: `Ngày ${dayNum}`,
        revenue: Math.round(revenue)
      };
    });


    // Doanh thu theo tuần (4 tuần gần nhất)
    const weekData = [];
    for (let i = 3; i >= 0; i--) {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      const revenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate && order.status === 'COMPLETED';
        })
        .reduce((sum, order) => sum + (order.finalAmount || 0), 0);

      weekData.push({
        day: `Tuần ${4 - i}`,
        revenue: Math.round(revenue)
      });
    }

    // Doanh thu theo tháng (5 tháng gần nhất)
    const monthData = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('vi-VN', { month: 'short' });
      const revenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear() &&
            order.status === 'COMPLETED';
        })
        .reduce((sum, order) => sum + (order.finalAmount || 0), 0);
      monthData.push({
        day: month,
        revenue: Math.round(revenue)
      });
    }
    return {
      Ngày: dayData,
      Tuần: weekData,
      Tháng: monthData
    };
  }, [orders]);

  const monthlyRevenueData = useMemo(() => {
    const year = parseInt(selectedYear);

    // Chỉ cho phép năm 2024 và 2025
    if (year !== 2024 && year !== 2025) {
      return [];
    }

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    // Tính doanh thu cho từng tháng
    const monthlyData = monthNames.map((month, idx) => {
      const revenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === idx &&
            orderDate.getFullYear() === year &&
            order.status !== 'Canceled';
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      return { month, revenue: Math.round(revenue) };
    });

    // Chỉ giữ lại các tháng có doanh thu > 0
    return monthlyData.filter(data => data.revenue > 0);
  }, [orders, selectedYear]);

  // Top 5 sản phẩm bán chạy
  const topProducts = useMemo(() => {
    return [...products]
      .filter(p => p.soldQuantity > 0)
      .sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0))
      .slice(0, 5)
      .map((product, idx) => ({
        name: product.proName,
        category: product.category?.categoryName || 'N/A',
        price: product.price,
        sold: product.soldQuantity || 0,
        increase: 0,
        image: product.images?.find((img: any) => img.isCover)?.imageUrl,
        percentage: Math.round(((product.soldQuantity || 0) / Math.max(...products.map(p => p.soldQuantity || 0))) * 100)
      }));
  }, [products]);

  interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: boolean;
    loading?: boolean;
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, loading }: StatCardProps) => (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-gray-500 text-sm font-medium">{title}</div>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      {loading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
      ) : (
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      )}
      <div className={`text-sm ${trend ? 'text-green-600' : 'text-gray-500'}`}>
        {subtitle}
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string> & { payload?: Array<{ value: number; payload: { day: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">
            {payload[0].value.toLocaleString()}₫
          </p>
          <p className="text-xs text-gray-500">{payload[0].payload.day}</p>
        </div>
      );
    }
    return null;
  };

  const isLoading = productsLoading || usersLoading || ordersLoading;

  return (
    <div className="min-h-screen bg-gray-50 pb-8 pt-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bảng điều khiển</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Star}
            title="Đánh giá trung bình"
            value={averageRating}
            subtitle={`Dựa trên ${totalReviews.toLocaleString()} đánh giá`}
            loading={productsLoading}
          />
          <StatCard
            icon={CreditCard}
            title="Tổng doanh thu tháng"
            value={`${currentMonthRevenue.toLocaleString()}₫`}
            subtitle={`${revenueChange.toFixed(1)}%`}
            trend={revenueChange >= 0}
            loading={ordersLoading}
          />
          <StatCard
            icon={ShoppingCart}
            title="Tổng đơn hàng"
            value={currentMonthOrders.toLocaleString()}
            subtitle={`${ordersChange.toFixed(1)}%`}
            trend={ordersChange >= 0}
            loading={ordersLoading}
          />
          <StatCard
            icon={Users}
            title="Tổng tài khoản"
            value={users.length.toLocaleString()}
            subtitle="Người dùng đã đăng ký"
            loading={usersLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Trạng thái đơn hàng</h2>
            {ordersLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
                      <div className="text-sm text-gray-500">Tổng đơn hàng</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {orderStatusData.map((status, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm text-gray-600">{status.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {status.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Revenue Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Doanh thu theo thời gian</h2>
              <div className="flex gap-2">
                {(['Ngày', 'Tuần', 'Tháng'] as const).map((range: TimeRange) => (
                  <motion.button
                    key={range}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {range}
                  </motion.button>
                ))}
              </div>
            </div>
            {ordersLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData[timeRange]}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Doanh thu hàng tháng</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>

            </select>
          </div>
          {ordersLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyRevenueData} barSize={40}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">
                            {payload[0].value?.toLocaleString()}₫
                          </p>
                          <p className="text-xs text-gray-500">Tháng {payload[0].payload.month}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#BFDBFE"
                  radius={[8, 8, 0, 0]}
                  activeBar={{ fill: '#3B82F6' }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top 5 sản phẩm bán chạy</h2>
            <span className="text-sm text-gray-500">Tất cả thời gian</span>
          </div>
          {productsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có sản phẩm nào được bán
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ backgroundColor: '#F9FAFB' }}
                  className="flex items-center justify-between py-3 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">{idx + 1}</span>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br rounded-xl overflow-hidden flex items-center justify-center shadow-lg border border-gray-600">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{product.sold.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">đã bán</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
