"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    Truck,
    Edit2,
    Save,
    X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { useOrders } from "@/hooks/useOrder";
import { useProductVariants } from "@/hooks/useVariant";

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
    { value: "CONFIRMED", label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
    { value: "WAITING_PICKUP", label: "Chờ lấy hàng", color: "bg-orange-100 text-orange-700" },
    { value: "SHIPPING", label: "Đang giao", color: "bg-purple-100 text-purple-700" },
    { value: "COMPLETED", label: "Hoàn thành", color: "bg-green-100 text-green-700" },
    { value: "CANCELLED", label: "Đã hủy", color: "bg-red-100 text-red-700" },
];

const ORDER_TYPE_OPTIONS = [
    { value: "PICKUP", label: "Đến lấy" },
    { value: "DELIVERY", label: "Giao hàng" },
];

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = parseInt(params?.orderId as string);

    const { getOrder, getOrderDetailsByOrder, updateOrderStatus, loading } = useOrders();
    const {getProductByOptionId} = useProductVariants();

    const [order, setOrder] = useState<any>(null);
    const [orderDetails, setOrderDetails] = useState<any[]>([]);
    const [productsMap, setProductsMap] = useState<Map<number, any>>(new Map());
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    // Load order data
    useEffect(() => {
        if (!orderId) return;
        (async () => {
            try {
                const orderData = await getOrder(orderId);
                setOrder(orderData);

                const detailsData = await getOrderDetailsByOrder(orderId);
                const details = detailsData.data || detailsData;
                setOrderDetails(details);

                // Lấy thông tin product cho từng option
                const productPromises = details.map(async (detail: any) => {
                    if (detail.option?.optionId) {
                        try {
                            const product = await getProductByOptionId(detail.option.optionId);
                            console.log(`[DEBUG] Product received for optionId ${detail.option.optionId}:`, product);
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
                setProductsMap(newProductsMap);

            } catch (error: any) {
                showToast("error", error.message || "Lỗi tải thông tin đơn hàng");
            }
        })();
    }, [orderId]);

    const handleUpdateStatus = async () => {
        try {
            await updateOrderStatus(orderId, { status: selectedStatus });
            setOrder({ ...order, status: selectedStatus });
            setIsEditingStatus(false);
            showToast("success", "Cập nhật trạng thái đơn hàng thành công!");
        } catch (error: any) {
            showToast("error", error.message || "Cập nhật trạng thái thất bại");
        }
    };

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const getStatusColor = (status: string) => {
        const found = STATUS_OPTIONS.find((s) => s.value === status);
        return found?.color || "bg-gray-100 text-gray-700";
    };

    const getStatusLabel = (status: string) => {
        const found = STATUS_OPTIONS.find((s) => s.value === status);
        return found?.label || status;
    };

    const getOrderTypeLabel = (type: string) => {
        const found = ORDER_TYPE_OPTIONS.find((t) => t.value === type);
        return found?.label || type;
    };

    const calculateSubTotal = () => {
        return orderDetails.reduce(
            (sum, detail) => sum + (detail.quantity * detail.price),
            0
        );
    };

    if (loading && !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Không tìm thấy đơn hàng</p>
                    <Link
                        href="/admin/orders"
                        className="mt-4 inline-block text-blue-600 hover:text-blue-700"
                    >
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

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
                            href="/admin"
                            className="hover:text-blue-600 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <span>/</span>
                        <Link
                            href="/admin/orders"
                            className="hover:text-blue-600 transition-colors"
                        >
                            Quản lý đơn hàng
                        </Link>
                        <span>/</span>
                        <span className="font-medium text-gray-800">Chi tiết đơn hàng</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/orders"
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Đơn hàng {order.orderCode || `#${order.orderId}`}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Ngày tạo:{" "}
                                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            {isEditingStatus ? (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {STATUS_OPTIONS.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleUpdateStatus}
                                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <Save className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setIsEditingStatus(false);
                                            setSelectedStatus(order.status);
                                        }}
                                        className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusLabel(order.status)}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsEditingStatus(true)}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - Order Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Details Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Sản phẩm trong đơn hàng
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {orderDetails.map((detail, index) => {
                                    const product = productsMap.get(detail.option?.optionId);
                                    const option = detail.option;

                                    return (
                                        <motion.div
                                            key={detail.detailId || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                        >
                                            {/* Product Image */}
                                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product?.images?.find((img: any) => img.isCover === true)?.imageUrl ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.images.find((img: any) => img.isCover === true).imageUrl}`}
                                                        alt={product.proName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : product?.images?.[0]?.imageUrl ? (
                                                    <img
                                                        src={product.images[0].imageUrl}
                                                        alt={product.proName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {product?.proName || "Sản phẩm"}
                                                </h3>
                                                
                                                {/* Variant Info */}
                                                {option && (
                                                    <div className="mt-1 space-y-1">
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Biến thể:</span>{" "}
                                                            {option.size && <span>Size {option.size}</span>}
                                                            {option.size && option.color && <span> • </span>}
                                                            {option.color && <span>Màu {option.color}</span>}
                                                        </p>
                                                        {option.sku && (
                                                            <p className="text-sm text-gray-500">
                                                                SKU: {option.sku}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-sm text-gray-600">
                                                        Số lượng: <span className="font-medium">{detail.quantity}</span>
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        Đơn giá:{" "}
                                                        <span className="font-medium">
                                                            {new Intl.NumberFormat("vi-VN", {
                                                                style: "currency",
                                                                currency: "VND",
                                                            }).format(detail.price)}
                                                        </span>
                                                    </span>
                                                </div>

                                                {/* Stock Info */}
                                                {option?.stockQuantity !== undefined && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Tồn kho: {option.stockQuantity} sản phẩm
                                                    </p>
                                                )}
                                            </div>

                                            {/* Total Price */}
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(detail.quantity * detail.price)}
                                                </p>
                                                
                                                {/* Category Badge */}
                                                {product?.category?.cateName && (
                                                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                                        {product.category.cateName}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Totals */}
                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính:</span>
                                    <span className="font-medium">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(calculateSubTotal())}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển:</span>
                                    <span className="font-medium">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(order.shippingFee || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Giảm giá:</span>
                                    <span className="font-medium text-red-600">
                                        -{new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(order.discount || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(order.totalAmount || 0)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Shipping Info */}
                        {order.customerAddress && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Thông tin giao hàng
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                                            <p className="text-gray-900 font-medium">
                                                {order.customerAddress}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT COLUMN - Customer & Order Info */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Thông tin khách hàng
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Họ tên</p>
                                    <p className="text-gray-900 font-medium">
                                        {order.user?.fullName || order.customerName || "—"}
                                    </p>
                                </div>

                                {(order.user?.email || order.customerEmail) && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="text-gray-900">
                                                {order.user?.email || order.customerEmail}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {(order.user?.phone || order.customerPhone) && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Số điện thoại</p>
                                            <p className="text-gray-900">
                                                {order.user?.phone || order.customerPhone}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Thông tin đơn hàng
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loại đơn hàng:</span>
                                    <span className="font-medium text-gray-900">
                                        {getOrderTypeLabel(order.orderType)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phương thức thanh toán:</span>
                                    <span className="font-medium text-gray-900">
                                        {order.paymentMethod || "Chưa xác định"}
                                    </span>
                                </div>

                                {order.transactionCode && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mã giao dịch:</span>
                                        <span className="font-semibold text-gray-900 font-mono">
                                            {order.transactionCode}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Trạng thái thanh toán:</span>
                                    <span className="font-medium text-gray-900">
                                        {order.paymentStatus === "PAID" ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                                Đã thanh toán
                                            </span>
                                        ) : (
                                            <span className="text-green-600 flex items-center gap-1">
                                                Đã thanh toán
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {order.note && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">Ghi chú:</p>
                                        <p className="text-gray-900">{order.note}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Lịch sử đơn hàng
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                    </div>
                                    <div className="pb-4">
                                        <p className="font-medium text-gray-900">Đơn hàng được tạo</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                </div>

                                {order.updateAt && order.updateAt !== order.createdAt && (
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Cập nhật trạng thái
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.updateAt).toLocaleString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <Toast toast={toast} />
        </div>
    );
}