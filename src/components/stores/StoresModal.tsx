'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { useStores } from '@/hooks/useStore';

interface StoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    setToast: (toast: { message: string; type: 'success' | 'error' }) => void;
    onSuccess?: (store: any) => void;
    store?: any;
}

export default function StoreModal({ isOpen, onClose, setToast, onSuccess, store }: StoreModalProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { createStore, updateStore } = useStores();

    const [formData, setFormData] = useState({
        storeName: '',
        address: '',
        latitude: 21.0285,
        longitude: 105.8542,
        isActive: true,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Load VietMap SDK
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Load VietMap CSS
        if (!document.getElementById('vietmap-css')) {
            const link = document.createElement('link');
            link.id = 'vietmap-css';
            link.rel = 'stylesheet';
            link.href = 'https://maps.vietmap.vn/api/maps/light/styles.css?api-version=1.1';
            document.head.appendChild(link);
        }

        // Load VietMap JS
        if (!(window as any).vietmapgl && !document.getElementById('vietmap-js')) {
            const script = document.createElement('script');
            script.id = 'vietmap-js';
            script.src = 'https://maps.vietmap.vn/api/maps/light/maplibre-gl-js/v2.4.3/maplibre-gl.js';
            script.onload = () => setIsMapLoaded(true);
            document.body.appendChild(script);
        } else if ((window as any).vietmapgl) {
            setIsMapLoaded(true);
        }
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!isOpen || !mapRef.current || mapInstanceRef.current || !isMapLoaded || !(window as any).vietmapgl) return;

        const vietmapgl = (window as any).vietmapgl;

        // Create map
        const map = new vietmapgl.Map({
            container: mapRef.current,
            style: 'https://maps.vietmap.vn/api/maps/light/styles.json?apikey=6e8afa909269b0ccd1f51002d85e69f5f33bb68866abba43',
            center: [formData.longitude, formData.latitude],
            zoom: 15,
        });

        mapInstanceRef.current = map;

        map.on('load', () => {
            // Add draggable marker
            const marker = new vietmapgl.Marker({
                draggable: true,
                color: '#3B82F6',
            })
                .setLngLat([formData.longitude, formData.latitude])
                .addTo(map);

            markerRef.current = marker;

            // Handle marker drag
            marker.on('dragend', async () => {
                const lngLat = marker.getLngLat();
                setFormData(prev => ({
                    ...prev,
                    latitude: lngLat.lat,
                    longitude: lngLat.lng,
                }));

                // Reverse geocoding using Nominatim
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lngLat.lat}&lon=${lngLat.lng}&accept-language=vi`
                    );
                    const data = await response.json();
                    if (data.display_name) {
                        setFormData(prev => ({ ...prev, address: data.display_name }));
                    }
                } catch (err) {
                    console.error('Reverse geocoding error:', err);
                }
            });

            // Handle map click
            map.on('click', async (e: any) => {
                const { lng, lat } = e.lngLat;

                marker.setLngLat([lng, lat]);
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                }));

                // Reverse geocoding
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
                    );
                    const data = await response.json();
                    if (data.display_name) {
                        setFormData(prev => ({ ...prev, address: data.display_name }));
                    }
                } catch (err) {
                    console.error('Reverse geocoding error:', err);
                }
            });
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isOpen, isMapLoaded]);

    // Update marker position when formData changes
    useEffect(() => {
        if (markerRef.current && mapInstanceRef.current) {
            markerRef.current.setLngLat([formData.longitude, formData.latitude]);
            mapInstanceRef.current.setCenter([formData.longitude, formData.latitude]);
        }
    }, [formData.latitude, formData.longitude]);

    // Search function using Nominatim
    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&accept-language=vi`
            );
            const data = await response.json();
            setSearchResults(data);
            setShowSearchResults(true);
        } catch (err) {
            console.error('Search error:', err);
            setSearchResults([]);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                handleSearch(searchQuery);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle search result click
    const handleSelectPlace = (place: any) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);

        setFormData(prev => ({
            ...prev,
            address: place.display_name,
            latitude: lat,
            longitude: lng,
        }));

        if (markerRef.current && mapInstanceRef.current) {
            markerRef.current.setLngLat([lng, lat]);
            mapInstanceRef.current.flyTo({
                center: [lng, lat],
                zoom: 17,
            });
        }

        setShowSearchResults(false);
        setSearchQuery('');
    };

    // Fill form data on edit
    useEffect(() => {
        if (store) {
            setFormData({
                storeName: store.storeName || '',
                address: store.address || '',
                latitude: store.latitude || 21.0285,
                longitude: store.longitude || 105.8542,
                isActive: store.isActive ?? true,
            });
        } else {
            setFormData({
                storeName: '',
                address: '',
                latitude: 21.0285,
                longitude: 105.8542,
                isActive: true,
            });
        }
    }, [store, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let newValue: any = value;
        if (type === 'checkbox' && 'checked' in e.target) {
            newValue = e.target.checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const num = parseFloat(value);
        if (!isNaN(num)) setFormData(prev => ({ ...prev, [name]: num }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate tên cửa hàng
        if (!formData.storeName.trim()) {
            setToast({ message: 'Vui lòng nhập tên cửa hàng', type: 'error' });
            return;
        }

        // Validate địa chỉ
        if (!formData.address.trim()) {
            setToast({ message: 'Vui lòng nhập địa chỉ cửa hàng', type: 'error' });
            return;
        }

        // Validate coordinates
        if (formData.latitude < -90 || formData.latitude > 90) {
            setToast({ message: 'Latitude phải trong khoảng -90 đến 90', type: 'error' });
            return;
        }

        if (formData.longitude < -180 || formData.longitude > 180) {
            setToast({ message: 'Longitude phải trong khoảng -180 đến 180', type: 'error' });
            return;
        }

        const payload = { ...formData };

        try {
            if (store) {
                await updateStore(store.storeId, payload);
                setToast({ message: 'Cập nhật cửa hàng thành công!', type: 'success' });
            } else {
                await createStore(payload);
                setToast({ message: 'Thêm cửa hàng thành công!', type: 'success' });
            }

            setFormData({
                storeName: '',
                address: '',
                latitude: 21.0285,
                longitude: 105.8542,
                isActive: true,
            });

            if (onSuccess) onSuccess(payload);
            onClose();
        } catch (err: any) {
            let message = 'Không thể lưu cửa hàng';
            if (err.response?.data?.message) message = err.response.data.message;

            // Kiểm tra lỗi trùng lặp địa chỉ từ backend
            if (err.response?.status === 409 || message.toLowerCase().includes('trùng') || message.toLowerCase().includes('duplicate')) {
                message = 'Địa chỉ này đã tồn tại trong hệ thống';
            }

            setToast({ message: `Lỗi: ${message}`, type: 'error' });
        }
    };

    // Reset map when modal closes
    useEffect(() => {
        if (!isOpen) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        }
    }, [isOpen]);

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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
                    >
                        <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl pointer-events-auto my-8">
                            <div className="flex items-start justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                    {store ? 'Sửa Cửa Hàng' : 'Thêm Cửa Hàng Mới'}
                                </h2>
                                <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Cột trái - Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Tên Cửa Hàng <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="storeName"
                                                value={formData.storeName}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: Chi nhánh Hà Nội"
                                                required
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Địa Chỉ
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Nhập địa chỉ cửa hàng..."
                                                rows={3}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Latitude
                                                </label>
                                                <input
                                                    type="number"
                                                    name="latitude"
                                                    value={formData.latitude}
                                                    onChange={handleCoordinateChange}
                                                    step="0.000001"
                                                    placeholder="21.0285"
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Longitude
                                                </label>
                                                <input
                                                    type="number"
                                                    name="longitude"
                                                    value={formData.longitude}
                                                    onChange={handleCoordinateChange}
                                                    step="0.000001"
                                                    placeholder="105.8542"
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                                />
                                            </div>
                                        </div>

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
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Đang hoạt động</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cột phải - Bản đồ */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                <MapPin className="w-4 h-4 inline mr-1" />
                                                Chọn Vị Trí Trên Bản Đồ
                                            </label>

                                            {/* Thanh tìm kiếm */}
                                            <div className="relative mb-3">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    ref={searchInputRef}
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Tìm kiếm địa điểm..."
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                />

                                                {/* Search results dropdown */}
                                                {showSearchResults && searchResults.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                        {searchResults.map((result, index) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => handleSelectPlace(result)}
                                                                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                                                            >
                                                                <div className="font-medium">{result.name || result.display_name.split(',')[0]}</div>
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.display_name}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bản đồ VietMap */}
                                            <div
                                                ref={mapRef}
                                                className="w-full h-[350px] rounded-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800"
                                            >
                                                {!isMapLoaded && (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="text-slate-500">Đang tải bản đồ...</div>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                💡 Click hoặc kéo marker để chọn vị trí chính xác
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                                        {store ? 'Lưu thay đổi' : 'Thêm cửa hàng'}
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