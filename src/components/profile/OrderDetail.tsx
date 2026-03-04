import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    MapPin,
    User,
    Phone,
    CreditCard,
    Calendar,
    FileText,
    Gift,
    AlertCircle,
    ClipboardCheck
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrder';
import { useProductVariants } from '@/hooks/useVariant';
import { Order } from '@/services/orderService';

const statusConfig = {
    PENDING: {
        label: 'Chờ xử lý',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: CheckCircle,
        active: true
    },
    
    WAITING_PICKUP: {
        label: 'Chờ lấy hàng',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: Clock,
        active: true
    },
    CONFIRMED: {
        label: 'Đã xác nhận',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: ClipboardCheck,
        active: true
    },
    SHIPPING: {
        label: 'Đang giao',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: Truck,
        active: true
    },
    COMPLETED: {
        label: 'Hoàn tất',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        active: true
    },
    CANCELLED: {
        label: 'Đã hủy',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: XCircle,
        active: false
    }
};

interface OrderDetailProps {
    orderId: number;
    onBack: () => void;
}

export default function OrderDetail({ orderId, onBack }: OrderDetailProps) {
    const { getOrder, getOrderDetailsByOrder, loading, error } = useOrders(999999);
    const { getProductByOptionId } = useProductVariants();

    const [order, setOrder] = useState<Order | null>(null);
    const [orderDetails, setOrderDetails] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [productsMap, setProductsMap] = useState<Map<number, any>>(new Map());

    // Fetch order details và products
    useEffect(() => {
        let isMounted = true;

        const fetchOrderDetail = async () => {
            try {
                setLoadingData(true);

                // Fetch order data
                const orderData = await getOrder(orderId);
                if (isMounted) {
                    setOrder(orderData);
                }

                // Fetch order details
                const detailsData = await getOrderDetailsByOrder(orderId);
                const details = detailsData.data || detailsData;

                if (isMounted) {
                    setOrderDetails(Array.isArray(details) ? details : []);
                }

                // Fetch product info cho từng option
                const productPromises = (Array.isArray(details) ? details : []).map(async (detail: any) => {
                    if (detail.option?.optionId) {
                        try {
                            const product = await getProductByOptionId(detail.option.optionId);
                            return { optionId: detail.option.optionId, product };
                        } catch (error) {
                            console.error(`Error fetching product for option ${detail.option.optionId}:`, error);
                            return null;
                        }
                    }
                    return null;
                });

                const productsData = await Promise.all(productPromises);
                const newProductsMap = new Map();
                productsData.forEach((data) => {
                    if (data) {
                        newProductsMap.set(data.optionId, data.product);
                    }
                });

                if (isMounted) {
                    setProductsMap(newProductsMap);
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                if (isMounted) {
                    setOrderDetails([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingData(false);
                }
            }
        };

        fetchOrderDetail();

        return () => {
            isMounted = false;
        };
    }, [orderId, getOrder, getOrderDetailsByOrder, getProductByOptionId]);

    const formatCurrency = (amount: any) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: any) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getOrderProgress = () => {
        const steps = ['PENDING', 'CONFIRMED', 'WAITING_PICKUP', 'SHIPPING', 'COMPLETED'];
        const currentIndex = steps.indexOf(order?.status || '');
        return steps.map((step, index) => ({
            ...statusConfig[step as keyof typeof statusConfig],
            completed: index <= currentIndex,
            current: index === currentIndex
        }));
    };

    const calculateDiscount = () => {
        if (!order || !Array.isArray(orderDetails) || orderDetails.length === 0) return 0;
        const totalOriginal = orderDetails.reduce((sum, item) => {
            const originalPrice = item.option?.originalPrice || item.price;
            return sum + (originalPrice * item.quantity);
        }, 0);
        return totalOriginal - order.totalAmount;
    };

    const calculateLoyaltyPoints = () => {
        return Math.floor((order?.finalAmount || 0) * 0.01);
    };

    if (loadingData || loading) {
        return (
            <div className="bg-white rounded-xl p-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white rounded-xl p-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
                >
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>
                <div className="text-center py-12">
                    <AlertCircle size={64} className="mx-auto text-red-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Không tìm thấy đơn hàng</p>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            </div>
        );
    }

    const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
    const StatusIcon = currentStatus.icon;
    const orderProgress = getOrderProgress();
    const discount = calculateDiscount();
    const loyaltyPoints = calculateLoyaltyPoints();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl p-8"
        >
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                >
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>
                <div className="text-center flex-1">
                    <h1 className="text-xl font-bold text-gray-800 mb-2">{order.orderCode}</h1>
                    <p className="text-sm text-gray-500">
                        <Calendar size={14} className="inline mr-1" />
                        {formatDate(order.createdAt)}
                    </p>
                </div>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${currentStatus.bgColor} ${currentStatus.color}`}>
                    <StatusIcon size={14} />
                    {currentStatus.label}
                </span>
            </div>

            {order.status !== 'CANCELLED' && (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                        Thông tin đơn hàng
                    </h2>
                    <p className="text-center text-sm text-gray-600 mb-4">
                        Nhân viên đang chuẩn bị giao hàng đến bạn
                    </p>
                    <div className="relative">
                        <div className="flex justify-between items-center">
                            {orderProgress.map((step, index) => (
                                <div key={index} className="flex flex-col items-center flex-1 relative z-10">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${step.completed
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'bg-gray-200 text-gray-400'
                                            }`}
                                    >
                                        <step.icon size={24} />
                                    </div>
                                    <span className={`text-xs text-center font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-0" style={{ width: 'calc(100% - 48px)', left: '24px' }}>
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{
                                    width: `${(orderProgress.filter(s => s.completed).length - 1) / (orderProgress.length - 1) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={18} className="text-blue-600" />
                            Thông tin người nhận
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <User size={16} className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Họ và tên</p>
                                    <p className="font-medium text-gray-800">
                                        {order.user?.fullName || 'Khách hàng'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone size={16} className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                    <p className="font-medium text-gray-800">
                                        {order.user?.phone || 'Chưa cập nhật'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-red-600" />
                            {order.orderType === 'PICKUP' ? 'Lấy hàng tại cửa hàng' : 'Nhận hàng tại'}
                        </h3>
                        <div className="space-y-2">
                            <p className="font-medium text-gray-800">{order.customerAddress}</p>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package size={18} className="text-purple-600" />
                            Danh sách sản phẩm ({Array.isArray(orderDetails) ? orderDetails.length : 0})
                        </h3>
                        {!Array.isArray(orderDetails) || orderDetails.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Package size={48} className="mx-auto mb-2 text-gray-300" />
                                <p>Không có sản phẩm nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orderDetails.map((detail, index) => {
                                    const product = productsMap.get(detail.option?.optionId);
                                    const option = detail.option;
                                    const coverImage = product?.images?.find((img: any) => img.isCover === true);
                                    const imageUrl = coverImage?.imageUrl || product?.images?.[0]?.imageUrl;

                                    return (
                                        <div key={detail.detailId || index} className="flex gap-4 px-4 py-2 bg-gray-50 rounded-lg">
                                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {imageUrl ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`}
                                                        alt={product?.proName || 'Sản phẩm'}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/80';
                                                        }}
                                                    />
                                                ) : (
                                                    <Package className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800 mb-1">
                                                    {product?.proName || 'Sản phẩm'}
                                                </h4>
                                                {option && (
                                                    <div className="mb-2 space-y-1">
                                                        <p className="text-xs text-gray-600">
                                                            {option.size && <span>Size {option.size}</span>}
                                                            {option.size && option.color && <span> • </span>}
                                                            {option.color && <span>Màu {option.color}</span>}
                                                        </p>
                                                        {option.sku && (
                                                            <p className="text-xs text-gray-500">SKU: {option.sku}</p>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500">Số lượng: {detail.quantity}</p>
                                                {product?.category?.cateName && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                                        {product.category.cateName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-600">{formatCurrency(detail.price)}</p>
                                                {option?.originalPrice && option.originalPrice > detail.price && (
                                                    <p className="text-sm text-gray-400 line-through">
                                                        {formatCurrency(option.originalPrice)}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600 mt-1">
                                                    = {formatCurrency(detail.quantity * detail.price)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border border-gray-200 rounded-xl p-5 sticky top-4">
                        <h3 className="font-semibold text-gray-800 mb-4">Thông tin thanh toán</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tổng tiền</span>
                                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá trực tiếp</span>
                                    <span className="font-medium">-{formatCurrency(discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                {order.shippingFee === 0 || !order.shippingFee ? (
                                    <span className="font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                                        Miễn phí
                                    </span>
                                ) : (
                                    <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                                )}
                            </div>
                            {loyaltyPoints > 0 && (
                                <div className="flex justify-between items-center text-amber-600">
                                    <span className="flex items-center gap-1">
                                        <Gift size={14} />
                                        Điểm tích lũy
                                    </span>
                                    <span className="font-medium">+{loyaltyPoints}</span>
                                </div>
                            )}
                            <div className="border-t pt-3 flex justify-between text-base">
                                <span className="font-semibold text-gray-800">Thành tiền</span>
                                <span className="font-bold text-red-600 text-lg">
                                    {formatCurrency(order.finalAmount)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <CreditCard size={16} />
                                Phương thức thanh toán
                            </h4>
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                                    {order.paymentMethod}
                                </span>
                                {order.payment?.status === 'SUCCESS' && (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle size={14} />
                                        Đã thanh toán
                                    </span>
                                )}
                                {order.payment?.status === 'PENDING' && (
                                    <span className="text-orange-600 flex items-center gap-1">
                                        <Clock size={14} />
                                        Chưa thanh toán
                                    </span>
                                )}
                            </div>
                        </div>

                        {order.note && (
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText size={16} />
                                    Ghi chú
                                </h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {order.note}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}