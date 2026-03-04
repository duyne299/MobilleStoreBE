'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, HelpCircle, MapPin, Check, Tag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/hooks/useStore';
import { useCart } from '@/hooks/useCart';
import DiscountModal from '@/components/discounts/DiscountModalCheckout';
import { Discount } from '@/services/discountService';
import Toast from '@/components/ui/Toast';
import { useOrders } from '@/hooks/useOrder';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';
import { useDiscounts } from '@/hooks/useDiscount';
import { useWarehouses } from '@/hooks/useWarehouse';
import { usePayment } from '@/hooks/usePayment';
import { PaymentGateway } from '@/services/paymentService';
import QRCodeModal from '@/components/payment/QrCodeModal';

interface CheckoutProduct {
    itemId: number;
    productName: string;
    productSlug: string;
    coverImage: string;
    rom: string;
    color: string;
    quantity: number;
    price: number;
    totalPrice: number;
    optionId: number;
}

interface CheckoutData {
    customerInfo: {
        fullName: string;
        phone: string;
    };
    products: CheckoutProduct[];
    totalAmount: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [deliveryMethod, setDeliveryMethod] = useState('home');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [note, setNote] = useState('');
    const [selectedStore, setSelectedStore] = useState<number | null>(null);
    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // QR Payment states
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrCodeData, setQRCodeData] = useState<{
        qrCodeURL: string;
        transactionCode: string;
    } | null>(null);

    // Discount states
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const { updateDiscount } = useDiscounts();
    const { importItem } = useWarehouses();

    // Error states
    const [errors, setErrors] = useState({
        address: false,
        store: false,
        payment: false
    });

    // Refs for focusing
    const addressInputRef = useRef<HTMLInputElement>(null);
    const storeSelectRef = useRef<HTMLSelectElement>(null);
    const paymentSectionRef = useRef<HTMLDivElement>(null);

    // Hooks
    const { stores, loading: storesLoading } = useStores(9999);
    const { createOrder, createOrderDetail } = useOrders();
    const { removeItem, items: cartItems } = useCart();
    const {
        createVietQRPayment,
        createVNPayPayment,
        startVietQRPolling
    } = usePayment();
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        const data = sessionStorage.getItem('checkoutData');
        if (!data) {
            router.push('/cart');
            return;
        }
        try {
            const parsedData: CheckoutData = JSON.parse(data);
            setCheckoutData(parsedData);
            setLoading(false);
        } catch (error) {
            router.push('/cart');
        }
    }, [router]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN') + 'đ';
    };

    const handleSelectDiscount = (discount: Discount, code: string) => {
        setAppliedDiscount(discount);
        setDiscountCode(code);
        setIsDiscountModalOpen(false);
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
    };

    const calculateDiscountAmount = () => {
        if (!checkoutData || !appliedDiscount) return 0;
        if (appliedDiscount.discountType === 'PERCENT') {
            const discountAmount = (checkoutData.totalAmount * appliedDiscount.value) / 100;
            return discountAmount;
        } else if (appliedDiscount.discountType === 'AMOUNT') {
            return Math.min(appliedDiscount.value, checkoutData.totalAmount);
        }
        return 0;
    };

    const calculateFinalAmount = () => {
        if (!checkoutData) return 0;
        const discountAmount = calculateDiscountAmount();
        return Math.max(0, checkoutData.totalAmount - discountAmount);
    };

    const getPaymentGateway = (method: string): PaymentGateway => {
        const paymentMap: Record<string, PaymentGateway> = {
            'cod': PaymentGateway.COD,
            'qr': PaymentGateway.VIETQR,
            'atm': PaymentGateway.VNPAY
        };
        return paymentMap[method] || PaymentGateway.COD;
    };

    // Tạo order và order details, giảm tồn kho
    const createOrderAndDetails = async () => {
        if (!checkoutData) throw new Error('Không có dữ liệu đơn hàng');

        const orderData = {
            storeId: deliveryMethod === 'store' ? selectedStore! : stores.find(s => s.isActive)?.storeId || 1,
            orderType: (deliveryMethod === 'store' ? 'PICKUP' : 'DELIVERY') as 'PICKUP' | 'DELIVERY',
            totalAmount: checkoutData.totalAmount,
            finalAmount: calculateFinalAmount(),
            customerAddress: deliveryMethod === 'home' ? deliveryAddress : '',
            note: note || '',
            paymentMethod: getPaymentGateway(paymentMethod),
            status: 'PENDING',
            ...(discountCode && { discountCode: discountCode })
        };

        const createdOrder = await createOrder(orderData);

        // Tạo OrderDetails
        const orderDetailPromises = checkoutData.products.map((product) =>
            createOrderDetail({
                order: createdOrder,
                option: { optionId: product.optionId } as any,
                quantity: product.quantity,
                price: product.price
            })
        );
        await Promise.all(orderDetailPromises);

        // Giảm tồn kho
        const storeIdForWarehouse = deliveryMethod === 'store'
            ? selectedStore!
            : stores.find(s => s.isActive)?.storeId || 1;

        const reduceStockPromises = checkoutData.products.map((product) =>
            importItem({
                optionId: product.optionId,
                storeId: storeIdForWarehouse,
                quantity: -product.quantity,
                note: `Xuất kho cho đơn hàng #${createdOrder.orderId}`
            })
        );

        try {
            await Promise.all(reduceStockPromises);
        } catch (stockError) {
            console.error('Lỗi khi giảm tồn kho:', stockError);
        }

        // Trừ usageLimit của discount
        if (appliedDiscount && appliedDiscount.usageLimit != null && appliedDiscount.usageLimit > 0) {
            try {
                await updateDiscount(appliedDiscount.discountId, {
                    usageLimit: appliedDiscount.usageLimit - 1
                });
            } catch (discountError) {
                console.error('Lỗi khi cập nhật discount:', discountError);
            }
        }

        return createdOrder;
    };

    // Hoàn tất đơn hàng COD và VietQR
    const completeOrder = async () => {
        if (!checkoutData) return;

        // Xóa sản phẩm khỏi giỏ hàng
        const cartItemIds = cartItems.map(item => item.itemId);
        const itemsToRemove = checkoutData.products.filter(product =>
            cartItemIds.includes(product.itemId)
        );

        if (itemsToRemove.length > 0) {
            const removePromises = itemsToRemove.map((product) =>
                removeItem(product.itemId)
            );
            await Promise.all(removePromises);
        }

        // Xóa dữ liệu checkout
        sessionStorage.removeItem('checkoutData');

        // Hiển thị thông báo thành công
        setToast({ type: 'success', message: 'Đặt hàng thành công!' });

        // Redirect
        setTimeout(() => {
            router.push('/profile?tab=orders');
        }, 1500);
    };

    // Xử lý QR payment success
    const handleQRPaymentSuccess = async () => {
        setShowQRModal(false);
        await completeOrder();
    };

    // Xử lý đặt hàng
    const handlePlaceOrder = async () => {
        // Validate form
        const newErrors = {
            address: false,
            store: false,
            payment: false
        };
        let firstError: 'payment' | 'store' | 'address' | null = null;

        if (!paymentMethod) {
            newErrors.payment = true;
            firstError = 'payment';
        }

        if (deliveryMethod === 'store' && !selectedStore) {
            newErrors.store = true;
            if (!firstError) firstError = 'store';
        }

        if (deliveryMethod === 'home' && !deliveryAddress.trim()) {
            newErrors.address = true;
            if (!firstError) firstError = 'address';
        }

        setErrors(newErrors);

        if (firstError) {
            setTimeout(() => {
                if (firstError === 'payment' && paymentSectionRef.current) {
                    paymentSectionRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    setToast({ type: 'error', message: 'Vui lòng chọn phương thức thanh toán' });
                } else if (firstError === 'store' && storeSelectRef.current) {
                    storeSelectRef.current.focus();
                    setToast({ type: 'error', message: 'Vui lòng chọn cửa hàng nhận hàng' });
                } else if (firstError === 'address' && addressInputRef.current) {
                    addressInputRef.current.focus();
                    setToast({ type: 'error', message: 'Vui lòng nhập địa chỉ nhận hàng' });
                }
            }, 100);
            return;
        }

        if (!checkoutData) return;
        setIsPlacingOrder(true);

        try {
            // 1. Tạo order
            const createdOrder = await createOrderAndDetails();

            // 2. Xử lý theo phương thức thanh toán
            if (paymentMethod === 'cod') {
                // COD: Hoàn tất ngay
                await completeOrder();
            } else if (paymentMethod === 'qr') {
                // VietQR: Hiển thị QR và bật polling
                const qrPayment = await createVietQRPayment({
                    orderId: createdOrder.orderId,
                    amount: calculateFinalAmount(),
                    description: `Thanh toán đơn hàng #${createdOrder.orderId}`
                });

                if (!qrPayment) {
                    throw new Error('Không thể tạo QR thanh toán');
                }

                setQRCodeData({
                    qrCodeURL: qrPayment.qrCode,
                    transactionCode: qrPayment.transactionCode
                });
                setShowQRModal(true);

                // Bắt đầu polling
                const stopPolling = startVietQRPolling(
                    createdOrder.orderId,
                    () => {
                        handleQRPaymentSuccess();
                    },
                    3000,
                    200
                );

                return () => stopPolling();
            } else if (paymentMethod === 'atm') {
                // VNPay: Redirect đến trang thanh toán
                const vnpayPayment = await createVNPayPayment({
                    orderId: createdOrder.orderId,
                    amount: calculateFinalAmount(),
                    returnUrl: `${window.location.origin}/payment-result`,
                    orderInfo: `Thanh toan don hang ${createdOrder.orderId}`
                });

                if (!vnpayPayment) {
                    throw new Error('Không thể tạo thanh toán VNPAY');
                }

                // Redirect đến VNPay sandbox
                window.location.href = vnpayPayment.paymentUrl;
            }
        } catch (error: any) {
            console.error('Lỗi khi đặt hàng:', error);
            setToast({
                type: 'error',
                message: error.message || 'Đặt hàng thất bại. Vui lòng thử lại!'
            });
            setIsPlacingOrder(false);
        }
    };

    const handleCloseQRModal = () => {
        setShowQRModal(false);
        setQRCodeData(null);
        setToast({
            type: 'error',
            message: 'Đã hủy thanh toán. Đơn hàng chưa được hoàn tất.'
        });
        setIsPlacingOrder(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!checkoutData) {
        return null;
    }

    const discountAmount = calculateDiscountAmount();
    const finalAmount = calculateFinalAmount();

    return (
        <>
            <Header />
            <div className="min-h-screen bg-[#F3F4F6]">
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <button
                            onClick={() => router.push('/cart')}
                            className="flex items-center text-blue-600 hover:text-blue-700"
                            disabled={isPlacingOrder}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="ml-1">Quay lại giỏ hàng</span>
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Products, Customer Info, Delivery, Payment */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Products */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg p-6"
                            >
                                <h2 className="text-lg font-semibold mb-4">
                                    Sản phẩm trong đơn ({checkoutData.products.length})
                                </h2>
                                {checkoutData.products.map((product, index) => (
                                    <div
                                        key={product.itemId}
                                        className={`flex items-start gap-4 py-4 ${index !== checkoutData.products.length - 1 ? 'border-b' : ''}`}
                                    >
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${product.coverImage}`}
                                            alt={product.productName}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm">{product.productName}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {product.rom} - {product.color}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">x{product.quantity}</p>
                                            <p className="font-semibold text-red-600">{formatPrice(product.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Customer Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-lg p-6"
                            >
                                <h2 className="text-lg font-semibold mb-4">Người đặt hàng</h2>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{checkoutData.customerInfo.fullName}</p>
                                        <p className="text-sm text-gray-600">{checkoutData.customerInfo.phone}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Delivery Method */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-lg p-6"
                            >
                                <h2 className="text-lg font-semibold mb-4">Hình thức nhận hàng</h2>
                                <div className="space-y-3 mb-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={deliveryMethod === 'home'}
                                            onChange={() => {
                                                setDeliveryMethod('home');
                                                setSelectedStore(null);
                                            }}
                                            disabled={isPlacingOrder}
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-3 text-sm">Giao hàng tận nơi</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={deliveryMethod === 'store'}
                                            onChange={() => setDeliveryMethod('store')}
                                            disabled={isPlacingOrder}
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-3 text-sm">Nhận tại cửa hàng</span>
                                    </label>
                                </div>

                                {deliveryMethod === 'home' && (
                                    <div className="space-y-3">
                                        <input
                                            ref={addressInputRef}
                                            type="text"
                                            value={deliveryAddress}
                                            onChange={(e) => {
                                                setDeliveryAddress(e.target.value);
                                                setErrors(prev => ({ ...prev, address: false }));
                                            }}
                                            disabled={isPlacingOrder}
                                            placeholder="Nhập địa chỉ nhận hàng"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                        />
                                        {errors.address && (
                                            <p className="text-xs text-red-600">Vui lòng nhập địa chỉ</p>
                                        )}
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            disabled={isPlacingOrder}
                                            placeholder="Ghi chú (tùy chọn)"
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            rows={3}
                                            maxLength={128}
                                        />
                                    </div>
                                )}

                                {deliveryMethod === 'store' && (
                                    <div>
                                        <select
                                            ref={storeSelectRef}
                                            value={selectedStore || ''}
                                            onChange={(e) => {
                                                setSelectedStore(Number(e.target.value));
                                                setErrors(prev => ({ ...prev, store: false }));
                                            }}
                                            disabled={storesLoading || isPlacingOrder}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.store ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                        >
                                            <option value="">Chọn cửa hàng</option>
                                            {stores.filter(s => s.isActive).map((store) => (
                                                <option key={store.storeId} value={store.storeId}>
                                                    {store.storeName} - {store.address}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.store && (
                                            <p className="text-xs text-red-600 mt-1">Vui lòng chọn cửa hàng</p>
                                        )}
                                    </div>
                                )}
                            </motion.div>

                            {/* Payment Method */}
                            <motion.div
                                ref={paymentSectionRef}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={`bg-white rounded-lg p-6 ${errors.payment ? 'ring-2 ring-red-500' : ''}`}
                            >
                                <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
                                {errors.payment && (
                                    <p className="text-sm text-red-600 mb-3">Vui lòng chọn phương thức thanh toán</p>
                                )}
                                <div className="space-y-3">
                                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${errors.payment ? 'border-red-300' : ''
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => {
                                                setPaymentMethod('cod');
                                                setErrors(prev => ({ ...prev, payment: false }));
                                            }}
                                            disabled={isPlacingOrder}
                                            className="w-4 h-4"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <img
                                                src="https://s3-sgn10.fptcloud.com/ict-payment-icon-prod/payment/cod.png"
                                                className="w-8 h-8"
                                                alt="cod"
                                            />
                                            <span className="ml-3 text-sm">Thanh toán khi nhận hàng</span>
                                        </div>
                                    </label>
                                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${errors.payment ? 'border-red-300' : ''
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'qr'}
                                            onChange={() => {
                                                setPaymentMethod('qr');
                                                setErrors(prev => ({ ...prev, payment: false }));
                                            }}
                                            disabled={isPlacingOrder}
                                            className="w-4 h-4"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <img
                                                src="https://s3-sgn10.fptcloud.com/ict-payment-icon-prod/payment/QR.png"
                                                className="w-8 h-8"
                                                alt="qr"
                                            />
                                            <span className="ml-3 text-sm">Chuyển khoản ngân hàng (QR Code)</span>
                                        </div>
                                    </label>
                                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${errors.payment ? 'border-red-300' : ''
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'atm'}
                                            onChange={() => {
                                                setPaymentMethod('atm');
                                                setErrors(prev => ({ ...prev, payment: false }));
                                            }}
                                            disabled={isPlacingOrder}
                                            className="w-4 h-4"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <img
                                                src="https://s3-sgn10.fptcloud.com/ict-payment-icon-prod/payment/vnpay.png"
                                                className="w-8 h-8"
                                                alt="vnpay"
                                            />
                                            <span className="ml-3 text-sm">Thẻ ATM nội địa (qua VNPAY)</span>
                                        </div>
                                    </label>
                                </div>
                            </motion.div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-lg p-6 sticky top-6"
                            >
                                {/* Discount */}
                                <div className="mb-4 pb-4 border-b">
                                    {!appliedDiscount ? (
                                        <button
                                            onClick={() => setIsDiscountModalOpen(true)}
                                            disabled={isPlacingOrder}
                                            className="w-full flex items-center justify-between p-3 border-2 border-dashed rounded-lg hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-5 h-5" />
                                                <span className="text-sm">Chọn mã giảm giá</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <div className="relative p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                                            <button
                                                onClick={handleRemoveDiscount}
                                                disabled={isPlacingOrder}
                                                className="absolute top-2 right-2 p-1 hover:bg-white rounded-full"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-600 mt-1" />
                                                <div>
                                                    <p className="font-bold text-green-800">{discountCode}</p>
                                                    <p className="text-sm text-green-600">
                                                        Tiết kiệm: {formatPrice(discountAmount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary */}
                                <h3 className="font-semibold mb-4">Tóm tắt đơn hàng</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span>Tổng tiền</span>
                                        <span className="font-medium">{formatPrice(checkoutData.totalAmount)}</span>
                                    </div>
                                    {appliedDiscount && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Giảm giá</span>
                                            <span className="font-medium">-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Phí vận chuyển</span>
                                        <span className="font-medium text-green-600">Miễn phí</span>
                                    </div>
                                    <div className="pt-3 border-t flex justify-between items-center">
                                        <span className="font-semibold">Cần thanh toán</span>
                                        <span className="text-xl font-bold text-red-600">
                                            {formatPrice(finalAmount)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder}
                                    className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 flex items-center justify-center"
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Đặt hàng'
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{' '}
                                    <a href="#" className="text-blue-600 underline">
                                        Điều khoản dịch vụ
                                    </a>
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQRModal && qrCodeData && (
                    <QRCodeModal
                        isOpen={showQRModal}
                        qrCodeURL={qrCodeData.qrCodeURL}
                        amount={finalAmount}
                        transactionCode={qrCodeData.transactionCode}
                        onClose={handleCloseQRModal}
                        onPaymentSuccess={handleQRPaymentSuccess}
                    />
                )}

                {/* Discount Modal */}
                <DiscountModal
                    isOpen={isDiscountModalOpen}
                    onClose={() => setIsDiscountModalOpen(false)}
                    onSelectDiscount={handleSelectDiscount}
                    currentTotal={checkoutData.totalAmount}
                    appliedDiscountCode={discountCode}
                />

                {/* Toast Notification */}
                <Toast toast={toast} />
            </div>
            <Footer />
            <ScrollToTopButton />
        </>
    );
}