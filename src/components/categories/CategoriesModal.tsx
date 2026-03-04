'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '@/hooks/useCategory';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    setToast: (toast: { message: string; type: 'success' | 'error' }) => void;
    onSuccess?: (category: any) => void;
    category?: any;
}

interface FormErrors {
    name?: string;
    description?: string;
    parentCategory?: string;
}

export default function CategoryModal({ isOpen, onClose, setToast, onSuccess, category }: CategoryModalProps) {
    const { createCategory, updateCategory, categories } = useCategories(100000);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentCategory: 'none',
        isVisible: true,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.categoryName,
                slug: category.slug,
                description: category.description || '',
                parentCategory: category.parentId || 'none',
                isVisible: category.isActive,
            });
        } else {
            setFormData({
                name: '',
                slug: '',
                description: '',
                parentCategory: 'none',
                isVisible: true,
            });
        }
        // Reset errors khi mở modal mới
        setErrors({});
        setTouched({});
    }, [category, isOpen]);

    const buildCategoryOptions = (categories: any[], parentId: number | null = null, level = 0): { id: number; name: string }[] => {
        let result: { id: number; name: string }[] = [];
        categories
            .filter(c => c.parentId === parentId)
            .forEach(c => {
                result.push({
                    id: c.categoryId,
                    name: `${'-'.repeat(level)} ${c.categoryName}`,
                });
                result = result.concat(buildCategoryOptions(categories, c.categoryId, level + 1));
            });
        return result;
    };
    const categoryOptions = buildCategoryOptions(categories);

    // Validation functions
    const validateField = (name: string, value: any): string | undefined => {
        switch (name) {
            case 'name':
                if (!value || value.trim().length === 0) {
                    return 'Tên danh mục không được để trống';
                }
                if (value.trim().length < 2) {
                    return 'Tên danh mục phải có ít nhất 2 ký tự';
                }
                if (value.trim().length > 100) {
                    return 'Tên danh mục không được vượt quá 100 ký tự';
                }
                // Kiểm tra trùng tên (trừ khi đang sửa chính nó)
                const duplicateName = categories.find(
                    c => c.categoryName.toLowerCase() === value.trim().toLowerCase() 
                    && c.categoryId !== category?.categoryId
                );
                if (duplicateName) {
                    return 'Tên danh mục đã tồn tại';
                }
                break;

            case 'description':
                if (value && value.length > 500) {
                    return 'Mô tả không được vượt quá 500 ký tự';
                }
                break;

            case 'parentCategory':
                // Kiểm tra không được chọn chính nó làm parent (khi đang sửa)
                if (category && value !== 'none' && Number(value) === category.categoryId) {
                    return 'Không thể chọn chính danh mục này làm danh mục cha';
                }
                // Kiểm tra không được chọn con của nó làm parent (tránh vòng lặp)
                if (category && value !== 'none') {
                    const isChildCategory = (parentId: number, targetId: number): boolean => {
                        const children = categories.filter(c => c.parentId === parentId);
                        if (children.some(c => c.categoryId === targetId)) return true;
                        return children.some(c => isChildCategory(c.categoryId, targetId));
                    };
                    if (isChildCategory(category.categoryId, Number(value))) {
                        return 'Không thể chọn danh mục con làm danh mục cha';
                    }
                }
                break;
        }
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        newErrors.name = validateField('name', formData.name);
        newErrors.description = validateField('description', formData.description);
        newErrors.parentCategory = validateField('parentCategory', formData.parentCategory);

        setErrors(newErrors);
        
        // Đánh dấu tất cả các field đã touched
        setTouched({
            name: true,
            description: true,
            parentCategory: true,
        });

        return !Object.values(newErrors).some(error => error !== undefined);
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));

        // Validate field khi thay đổi (nếu đã touched)
        if (touched[name]) {
            const error = validateField(name, newValue);
            setErrors(prev => ({
                ...prev,
                [name]: error,
            }));
        }
    };

    const handleBlur = (e: any) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true,
        }));

        // Validate field khi blur
        const error = validateField(name, formData[name as keyof typeof formData]);
        setErrors(prev => ({
            ...prev,
            [name]: error,
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Validate toàn bộ form
        if (!validateForm()) {
            setToast({ message: 'Vui lòng kiểm tra lại thông tin', type: 'error' });
            return;
        }

        const payload = {
            categoryName: formData.name.trim(),
            description: formData.description.trim(),
            parentId: formData.parentCategory === 'none' ? null : Number(formData.parentCategory),
            isActive: formData.isVisible,
        };

        try {
            if (category) {
                await updateCategory(category.slug, payload);
                setToast({ message: 'Cập nhật danh mục thành công!', type: 'success' });
            } else {
                await createCategory(payload);
                setToast({ message: 'Thêm danh mục thành công!', type: 'success' });
            }

            setFormData({
                name: '',
                slug: '',
                description: '',
                parentCategory: 'none',
                isVisible: true,
            });

            if (onSuccess) onSuccess(payload);

            onClose();
        } catch (err: any) {
            let message = 'Không thể lưu danh mục';

            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            }

            setToast({ message: `Lỗi: ${message}`, type: 'error' });
        }
    };

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
                        <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl pointer-events-auto">
                            <div className="flex items-start justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                    {category ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                                </h2>
                                <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Tên Danh Mục <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ví dụ: Laptop"
                                        className={`w-full rounded-lg border px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:text-white dark:placeholder:text-slate-500 ${
                                            errors.name && touched.name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                                                : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800'
                                        }`}
                                    />
                                    {errors.name && touched.name && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Mô Tả
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Nhập mô tả ngắn gọn..."
                                        rows={6}
                                        className={`w-full rounded-lg border px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:text-white dark:placeholder:text-slate-500 resize-none ${
                                            errors.description && touched.description
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                                                : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800'
                                        }`}
                                    />
                                    <div className="mt-1 flex items-center justify-between">
                                        {errors.description && touched.description ? (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.description}
                                            </p>
                                        ) : (
                                            <span></span>
                                        )}
                                        <span className={`text-xs ${formData.description.length > 500 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {formData.description.length}/500
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Danh Mục Cha
                                    </label>
                                    <select
                                        name="parentCategory"
                                        value={formData.parentCategory}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 dark:text-white ${
                                            errors.parentCategory && touched.parentCategory
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                                                : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800'
                                        }`}
                                    >
                                        <option value="none">Không có danh mục cha</option>
                                        {categoryOptions.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.parentCategory && touched.parentCategory && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.parentCategory}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Trạng Thái
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                name="isVisible"
                                                checked={formData.isVisible}
                                                onChange={handleChange}
                                                className="peer sr-only"
                                            />
                                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:border-slate-600 dark:bg-slate-700 dark:peer-focus:ring-green-800"></div>
                                        </label>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Hiển thị</span>
                                    </div>
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
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {category ? 'Lưu thay đổi' : 'Thêm danh mục'}
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