'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Link2, Calendar, ArrowUpDown } from 'lucide-react';
import { useBanners } from '@/hooks/useBanner';

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    setToast: (toast: { message: string; type: 'success' | 'error' }) => void;
    onSuccess?: (banner: any) => void;
    banner?: any; // banner đang sửa
}

export default function BannerModal({
    isOpen,
    onClose,
    setToast,
    onSuccess,
    banner,
}: BannerModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        linkTarget: '',
        excerpt: '',
        startDate: '',
        endDate: '',
        position: '',
        isActive: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const { createBanner, updateBanner } = useBanners();
    const [preview, setPreview] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    // Khi banner thay đổi (chọn sửa), điền dữ liệu vào form
    useEffect(() => {
        if (banner) {
            setFormData({
                title: banner.title || '',
                linkTarget: banner.linkTarget || '',
                excerpt: banner.excerpt || '',
                startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
                endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
                position: banner.position || '',
                isActive: banner.isActive ?? true,
            });
            setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${banner.imageUrl}` || '');
            setImageFile(null);
        } else {
            setFormData({
                title: '',
                linkTarget: '',
                excerpt: '',
                startDate: '',
                endDate: '',
                position: '',
                isActive: true,
            });
            setImagePreview('');
            setImageFile(null);
        }
    }, [banner]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setToast({ message: 'Vui lòng chọn file hình ảnh', type: 'error' });
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setToast({ message: 'Kích thước file không được vượt quá 5MB', type: 'error' });
                return;
            }
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        const titleTrimmed = formData.title.trim();
        const titleToUse = titleTrimmed || banner?.title?.trim() || '';
        const linkToUse = formData.linkTarget.trim() || banner?.linkTarget?.trim() || '';
        const startDateToUse = formData.startDate || banner?.startDate || '';
        const endDateToUse = formData.endDate || banner?.endDate || '';

        // Validation
        if (!titleToUse) {
            setToast({ message: 'Vui lòng nhập tiêu đề banner', type: 'error' });
            return;
        }
        if (!linkToUse) {
            setToast({ message: 'Vui lòng nhập link liên kết', type: 'error' });
            return;
        }
        if (!startDateToUse || !endDateToUse) {
            setToast({ message: 'Vui lòng chọn thời gian bắt đầu và kết thúc', type: 'error' });
            return;
        }
        if (new Date(startDateToUse) >= new Date(endDateToUse)) {
            setToast({ message: 'Ngày kết thúc phải sau ngày bắt đầu', type: 'error' });
            return;
        }
        if (!banner && !imageFile) {
            setToast({ message: 'Vui lòng chọn hình ảnh banner', type: 'error' });
            return;
        }

        const formDataToSend = new FormData();

        formDataToSend.append('title', titleToUse);
        formDataToSend.append('linkTarget', linkToUse);
        formDataToSend.append('startDate', startDateToUse);
        formDataToSend.append('endDate', endDateToUse);
        formDataToSend.append('position', formData.position || banner?.position || '');
        formDataToSend.append('excerpt', formData.excerpt || banner?.excerpt || '');
        formDataToSend.append('isActive', (formData.isActive ?? banner?.isActive ?? true).toString());

        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }

        try {
            if (banner && updateBanner) {
                await updateBanner(banner.bannerId, formDataToSend);
                setToast({ message: 'Cập nhật banner thành công!', type: 'success' });
            } else if (createBanner) {
                await createBanner(formDataToSend);
                setToast({ message: 'Thêm banner thành công!', type: 'success' });
            }

            setFormData({
                title: '',
                linkTarget: '',
                startDate: '',
                endDate: '',
                position: '',
                excerpt: '',
                isActive: true,
            });
            setImageFile(null);
            setImagePreview('');

            if (onSuccess) onSuccess(formData);
            onClose();
        } catch (err: any) {
            let message = 'Không thể lưu banner';
            if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            setToast({ message: `Lỗi: ${message}`, type: 'error' });
        }
    };



    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setFormData(prev => ({ ...prev, thumbnail: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
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
                        <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 p-1 shadow-2xl pointer-events-auto my-8 ">
                            <div className='p-6 max-h-[95vh] overflow-y-auto rounded-xl'>
                                <div className="flex items-start justify-between">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                        {banner ? 'Sửa Banner' : 'Thêm Banner Mới'}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-6 space-y-4" onKeyDown={handleKeyDown}>
                                    {/* Hình ảnh Banner */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Hình Ảnh Banner {!banner && <span className="text-red-500">*</span>}
                                        </label>
                                        <div
                                            onClick={() => document.getElementById("banner-upload")?.click()}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            className={`relative w-full h-40 flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer duration-200 hover:scale-[1.01] ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-gray-50 dark:border-slate-700"
                                                }`}
                                        >
                                            {imagePreview ? (
                                                <div className="relative w-full h-full group">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Xem trước ảnh banner"
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImagePreview('');
                                                            setImageFile(null);
                                                        }}
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                                                    >
                                                        <div className="flex flex-col items-center gap-2">
                                                            <svg
                                                                className="w-8 h-8 text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            <span className="text-white text-sm font-medium">Xóa ảnh</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="w-12 h-12 text-gray-400 mb-3"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 16a4 4 0 01-.88-7.9A5 5 0 1116 6a5 5 0 011 9.9M15 13l-3-3-3 3m3-3v12"
                                                        />
                                                    </svg>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        Kéo thả file hoặc{" "}
                                                        <span className="text-blue-600 font-semibold underline">chọn file</span>
                                                    </p>
                                                </>
                                            )}
                                            <input
                                                id="banner-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>



                                    {/* Tiêu đề */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Tiêu Đề <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Ví dụ: Sale mùa hè 2024"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </div>

                                    {/* Mô tả ngắn */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Mô Tả Ngắn
                                        </label>
                                        <textarea
                                            name="excerpt"
                                            value={formData.excerpt}
                                            onChange={handleChange}
                                            placeholder="Nhập mô tả ngắn của banner..."
                                            rows={3}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                        />
                                    </div>

                                    {/* Link URL */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Link URL <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="url"
                                                name="linkTarget"
                                                value={formData.linkTarget}
                                                onChange={handleChange}
                                                placeholder="https://example.com/sale"
                                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Thời gian */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Ngày Bắt Đầu <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="date"
                                                    name="startDate"
                                                    value={formData.startDate}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Ngày Kết Thúc <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="date"
                                                    name="endDate"
                                                    value={formData.endDate}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thứ tự hiển thị */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Vị trí
                                        </label>
                                        <div className="relative">
                                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                name="position"
                                                value={formData.position}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: Top, Bottom,..."
                                                min="0"
                                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Trạng thái */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Trạng Thái
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleChange}
                                                    className="peer sr-only"
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:border-slate-600 dark:bg-slate-700 dark:peer-focus:ring-green-800"></div>
                                            </label>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {formData.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
                                        >
                                            {banner ? 'Lưu thay đổi' : 'Thêm banner'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}