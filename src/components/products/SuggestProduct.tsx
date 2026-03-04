"use client";
import ProductCard from "@/components/products/ProductCard";
import { useEffect, useState } from "react";
import { useProducts } from '@/hooks/useProduct';
import { useWarehouses } from '@/hooks/useWarehouse';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SuggestedProducts() {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const { getByCategoryId, loading } = useProducts();
    const { getByProduct } = useWarehouses();
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Load sản phẩm từ category 4-11
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const allProducts: any[] = [];

                // Lấy sản phẩm từ categoryId 4 đến 11
                for (let categoryId = 4; categoryId <= 11; categoryId++) {
                    try {
                        const categoryProducts = await getByCategoryId(categoryId); // trả trực tiếp mảng product đã preload
                        if (Array.isArray(categoryProducts)) {
                            allProducts.push(...categoryProducts);
                        }
                    } catch (err) {
                        console.error(`Lỗi tải sản phẩm cho categoryId=${categoryId}:`, err);
                    }
                }
                // Shuffle ngẫu nhiên mảng
                const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
                // Lấy 10 sản phẩm cho desktop, 8 cho mobile
                const selectedCount = 10;
                const randomProducts = shuffled.slice(0, selectedCount);

                // Lấy thông tin warehouse cho từng sản phẩm
                const productsWithWarehouse = await Promise.all(
                    randomProducts.map(async (product) => {
                        try {
                            const warehouseData = await getByProduct(product.proId);

                            // Lọc warehouse có tồn kho > 0 và lấy giá thấp nhất
                            const availableWarehouses = warehouseData.filter(
                                (w: any) => w.quantity > 0
                            );

                            if (availableWarehouses.length > 0) {
                                // Lấy giá thấp nhất từ các warehouse còn hàng
                                const lowestPrice = Math.min(
                                    ...availableWarehouses.map((w: any) => w.baseSalePrice)
                                );

                                return {
                                    ...product,
                                    baseSalePrice: lowestPrice,
                                    warehouseData: availableWarehouses
                                };
                            }

                            // Nếu không có warehouse còn hàng, lấy giá từ warehouse đầu tiên
                            return {
                                ...product,
                                baseSalePrice: warehouseData[0]?.baseSalePrice || product.price,
                                warehouseData: warehouseData
                            };
                        } catch (error) {
                            console.error(`Lỗi khi tải warehouse cho sản phẩm ${product.proId}:`, error);
                            return {
                                ...product,
                                baseSalePrice: product.price,
                                warehouseData: []
                            };
                        }
                    })
                );

                setProducts(productsWithWarehouse);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            }
        };

        loadProducts();
    }, [getByCategoryId, getByProduct]);

    // Format giá VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Tính giá khuyến mãi (giảm 5-12% ngẫu nhiên)
    const calculateDiscount = (price: number, index: number) => {
        const discounts = [5, 7, 8, 10, 11, 12, 6, 9, 8, 11];
        const discountPercent = discounts[index % discounts.length];
        return {
            newPrice: Math.round(price * (1 - discountPercent / 100)),
            discount: `-${discountPercent}%`,
            savedAmount: Math.round(price * discountPercent / 100)
        };
    };

    // Slice products based on screen size: 8 for mobile/tablet, 10 for desktop
    const displayedProducts = isMobile ? products.slice(0, 8) : products;

    if (loading && products.length === 0) {
        return (
            <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
                    <div className="p-8 text-center">
                        <div className="text-gray-500">Đang tải sản phẩm...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-12 md:px-16 lg:px-40 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 rounded-2xl bg-white">
                <div className="flex items-center justify-between mb-2 sm:mb-6 pt-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Gợi ý cho bạn
                    </h2>
                    <button 
                        onClick={() => router.push('/product')}
                        className="text-red-600 text-sm sm:text-base font-medium hover:underline"
                    >
                        Xem tất cả &gt;
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 pb-4">
                    {displayedProducts.map((product, index) => {
                        const basePrice = product.baseSalePrice || product.price;
                        const { newPrice, discount, savedAmount } = calculateDiscount(basePrice, index);
                        const hasStock = product.warehouseData && product.warehouseData.some((w: any) => w.quantity > 0);

                        const transformedProduct = {
                            id: product.proId,
                            name: product.proName,
                            slug: product.slug,
                            image: `${process.env.NEXT_PUBLIC_API_URL}${product.images.find((img: any) => img.isCover)?.imageUrl}`,
                            originalPrice: formatPrice(basePrice),
                            price: formatPrice(newPrice),
                            discount: discount,
                            savedAmount: formatPrice(savedAmount),
                            installment: true,
                            rating: product.rating,
                            ratingCount: Math.floor(Math.random() * 1000) + 100,
                            specs: ['cpu', 'cameraFront', 'battery'].map((key) => {
                                let value = product.specification?.[key];
                                if (!value || String(value).trim() === '') return null;

                                if (key === 'battery') {
                                    // Chỉ lấy phần trước dấu phẩy
                                    value = String(value).split(',')[0].trim();
                                }

                                return { text: value };
                            }).filter(Boolean) || [],

                            hasStock: hasStock
                        };

                        return (
                            <motion.div
                                key={product.proId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <ProductCard product={transformedProduct} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}