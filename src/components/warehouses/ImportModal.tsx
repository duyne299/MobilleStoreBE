'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWarehouses } from '@/hooks/useWarehouse';
import { useStores } from '@/hooks/useStore';
import { useProductVariants } from '@/hooks/useVariant';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    setToast: (toast: { message: string; type: 'success' | 'error' }) => void;
    onSuccess?: () => void;
    warehouse?: any;
}

export default function ImportModal({ isOpen, onClose, setToast, onSuccess, warehouse }: ImportModalProps) {
    const { importItem: importToWarehouse, items, fetchItems } = useWarehouses(999999);
    const { variants, fetchVariants } = useProductVariants(99999);
    const { stores, fetchStores } = useStores(99999999);
    
    const [formData, setFormData] = useState({
        productOptionId: '',
        storeId: '',
        importPrice: '',
        baseSalePrice: '',
        quantity: '',
    });

    // Load danh sách sản phẩm, cửa hàng và kho khi modal mở
    useEffect(() => {
        if (isOpen) {
            fetchVariants();
            fetchStores();
            fetchItems();
        }
    }, [isOpen]);

    // Nếu có warehouse (nhập thêm), điền thông tin vào form
    useEffect(() => {
        if (warehouse) {
            setFormData({
                productOptionId: warehouse.optionId?.toString() || '',
                storeId: warehouse.storeId?.toString() || '',
                importPrice: warehouse.importPrice?.toString() || '',
                baseSalePrice: warehouse.baseSalePrice?.toString() || '',
                quantity: '',
            });
        } else {
            setFormData({
                productOptionId: '',
                storeId: '',
                importPrice: '',
                baseSalePrice: '',
                quantity: '',
            });
        }
    }, [warehouse]);

    // Hàm tìm giá từ kho dựa trên optionId và storeId
    const findWarehousePrices = (optionId: string, storeId: string) => {
        if (!optionId || !storeId) return null;
        
        const existingWarehouse = items.find(
            (wh: any) => 
                wh.optionId?.toString() === optionId && 
                wh.storeId?.toString() === storeId
        );
        
        return existingWarehouse;
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newFormData = {
                ...prev,
                [name]: value,
            };

            // Nếu thay đổi productOptionId hoặc storeId, tự động load giá từ kho
            if ((name === 'productOptionId' || name === 'storeId') && !warehouse) {
                const optionId = name === 'productOptionId' ? value : prev.productOptionId;
                const storeId = name === 'storeId' ? value : prev.storeId;
                
                const existingWarehouse = findWarehousePrices(optionId, storeId);
                
                if (existingWarehouse) {
                    // Nếu tìm thấy trong kho, load giá nhập và giá bán
                    newFormData.importPrice = existingWarehouse.importPrice?.toString() || '';
                    newFormData.baseSalePrice = existingWarehouse.baseSalePrice?.toString() || '';
                } else {
                    // Nếu không tìm thấy, reset giá về rỗng
                    newFormData.importPrice = '';
                    newFormData.baseSalePrice = '';
                }
            }

            return newFormData;
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        
        // Validation - kiểm tra đầy đủ thông tin
        if (!formData.productOptionId && !formData.storeId && !formData.importPrice && !formData.baseSalePrice && !formData.quantity) {
            setToast({ message: 'Vui lòng điền đầy đủ thông tin!', type: 'error' });
            return;
        }
        if (!formData.productOptionId) {
            setToast({ message: 'Vui lòng chọn sản phẩm!', type: 'error' });
            return;
        }
        if (!formData.storeId) {
            setToast({ message: 'Vui lòng chọn cửa hàng!', type: 'error' });
            return;
        }
        if (!formData.importPrice) {
            setToast({ message: 'Vui lòng nhập giá nhập!', type: 'error' });
            return;
        }
        if (!formData.baseSalePrice) {
            setToast({ message: 'Vui lòng nhập giá bán!', type: 'error' });
            return;
        }
        if (!formData.quantity) {
            setToast({ message: 'Vui lòng nhập số lượng!', type: 'error' });
            return;
        }
        
        // Validation - số lượng phải >= 1
        if (Number(formData.quantity) < 1) {
            setToast({ message: 'Số lượng phải lớn hơn hoặc bằng 1!', type: 'error' });
            return;
        }
        
        // Validation - giá nhập phải nhỏ hơn giá bán
        if (Number(formData.importPrice) > Number(formData.baseSalePrice)) {
            setToast({ message: 'Giá nhập phải nhỏ hơn giá bán!', type: 'error' });
            return;
        }

        const payload = {
            optionId: Number(formData.productOptionId),
            storeId: Number(formData.storeId),
            importPrice: Number(formData.importPrice) || 0,
            baseSalePrice: Number(formData.baseSalePrice) || 0,
            quantity: Number(formData.quantity),
        };

        try {
            await importToWarehouse(payload);
            setToast({
                message: warehouse
                    ? `Nhập thêm ${formData.quantity} sản phẩm thành công!`
                    : 'Nhập kho thành công!',
                type: 'success'
            });
            
            // Reset form
            setFormData({
                productOptionId: '',
                storeId: '',
                importPrice: '',
                baseSalePrice: '',
                quantity: '',
            });
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            let message = 'Không thể nhập kho';
            if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            setToast({ message: `Lỗi: ${message}`, type: 'error' });
        }
    };

    // Kiểm tra xem có thông tin giá từ kho không
    const existingWarehouse = !warehouse && formData.productOptionId && formData.storeId 
        ? findWarehousePrices(formData.productOptionId, formData.storeId) 
        : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                        {warehouse ? 'Nhập thêm hàng' : 'Nhập kho mới'}
                                    </h2>
                                    {warehouse && (
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            Sản phẩm: <span className="font-medium">{warehouse.productName}</span>
                                            {warehouse.optionName && ` - ${warehouse.optionName}`}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                {/* Dropdown sản phẩm - chỉ hiện khi nhập mới */}
                                {!warehouse && (
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Chọn Sản Phẩm <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="productOptionId"
                                            value={formData.productOptionId}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="">-- Chọn sản phẩm --</option>
                                            {[...variants]
                                                .filter((v) => !v.product.isDeleted)
                                                .reverse()
                                                .map((v) => (
                                                    <option key={v.optionId} value={v.optionId}>
                                                        {v.product.proName} - {v.rom && v.color || 'Mặc định'}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                {/* Dropdown cửa hàng */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Cửa Hàng <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="storeId"
                                        value={formData.storeId}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        disabled={!!warehouse}
                                    >
                                        <option value="">-- Chọn cửa hàng --</option>
                                        {stores.map((store) => (
                                            <option key={store.storeId} value={store.storeId}>
                                                {store.storeName} - {store.address}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Thông báo nếu tìm thấy giá từ kho */}
                                {existingWarehouse && (
                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            ℹ️ Đã tìm thấy giá từ kho hiện tại (Tồn: <span className="font-semibold">{existingWarehouse.quantity}</span> sản phẩm)
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Giá nhập */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Giá Nhập (VNĐ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="importPrice"
                                            value={formData.importPrice}
                                            onChange={handleChange}
                                            placeholder="0"
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </div>

                                    {/* Giá bán */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Giá Bán (VNĐ) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="baseSalePrice"
                                            value={formData.baseSalePrice}
                                            onChange={handleChange}
                                            placeholder="0"
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* Số lượng */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Số Lượng {warehouse ? 'Nhập Thêm' : ''} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        placeholder={warehouse ? `Hiện có: ${warehouse.quantity}` : "0"}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                    />
                                    {warehouse && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Tổng sau khi nhập: <span className="font-medium text-blue-600">
                                                {warehouse.quantity + (Number(formData.quantity) || 0)}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
                                    >
                                        {warehouse ? 'Nhập thêm' : 'Nhập kho'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}