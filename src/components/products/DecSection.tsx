import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProduct';
import { usePosts } from '@/hooks/usePost';

export default function DecSection({ productSlug }: { productSlug: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [product, setProduct] = useState<any>(null);
    const [randomPosts, setRandomPosts] = useState<any[]>([]);
    const sectionRef = useRef(null);
    const contentRef = useRef<HTMLDivElement | null>(null)

    const { getProductBySlug } = useProducts();
    const { posts, loading: postsLoading } = usePosts(50);

    // Fetch product data
    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await getProductBySlug(productSlug);
                setProduct(data);
            } catch (error) {
                console.error('Error loading product:', error);
            }
        };

        if (productSlug) {
            loadProduct();
        }
    }, [productSlug, getProductBySlug]);

    // Get 4 random posts
    useEffect(() => {
        if (posts && posts.length > 0) {
            const shuffled = [...posts].sort(() => 0.5 - Math.random());
            setRandomPosts(shuffled.slice(0, 4));
        }
    }, [posts]);

    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current && sectionRef.current) {
                const element = contentRef.current;
                const rect = element.getBoundingClientRect();
                const elementHeight = element.offsetHeight;
                const windowHeight = window.innerHeight;

                const scrolled = Math.max(0, windowHeight - rect.top);
                const progress = Math.min(1, scrolled / elementHeight);

                setScrollProgress(progress);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!product) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div ref={sectionRef} className=" bg-[#F3F4F6] sm:py-6 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-12">
                    <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                        {/* Left side - Product Description */}
                        <div ref={contentRef} className="space-y-4 sm:space-y-6 lg:col-span-2">
                            <motion.h1
                                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                Mô tả sản phẩm
                            </motion.h1>

                            {/* Product Image */}
                            <motion.div
                                className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-900 via-purple-600 to-pink-500"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className="aspect-[16/10] relative">
                                    <img
                                        src={
                                            (product.images?.find((img: any) => img.isCover)?.imageUrl
                                                ? `${process.env.NEXT_PUBLIC_API_URL}${product.images.find((img: any) => img.isCover)?.imageUrl}`
                                                : "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop")
                                        }
                                        alt={product.name || "Product"}
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                </div>

                                {!isExpanded && product.description && (
                                    <motion.button
                                        onClick={() => setIsExpanded(true)}
                                        className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold hover:shadow-xl transition-shadow"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Đọc thêm
                                    </motion.button>
                                )}
                            </motion.div>

                            {/* Expanded Content - TinyMCE description */}
                            <AnimatePresence>
                                {isExpanded && product.description && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="space-y-4 sm:space-y-6 overflow-hidden"
                                    >
                                        <div
                                            className="bg-white p-4 sm:p-6 lg:p-8 prose prose-sm sm:prose-base lg:prose-lg max-w-none"
                                            dangerouslySetInnerHTML={{ __html: product.description }}
                                        />

                                        {/* Collapse button at the bottom */}
                                        <div className="flex justify-center pt-2 sm:pt-4">
                                            <motion.button
                                                onClick={() => setIsExpanded(false)}
                                                className="bg-white text-gray-900 border border-gray-200 px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-shadow"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Thu gọn
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right side - Related Articles (Sticky on desktop, normal flow on mobile) */}
                        <div className="lg:sticky lg:top-8 h-fit lg:col-span-1">
                            <div className="space-y-4 sm:space-y-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Thông tin hay</h2>
                                </div>

                                <div className="flex gap-2 mb-4 sm:mb-6">
                                    <p className="py-2 text-xs sm:text-sm text-red-600 border-red-600">
                                        Bài viết liên quan
                                    </p>
                                </div>

                                <motion.div
                                    className="space-y-3 sm:space-y-4"
                                    style={{
                                        opacity: 0.3 + (scrollProgress * 0.7)
                                    }}
                                >
                                    {postsLoading ? (
                                        <div className="text-gray-500 text-center py-8">Đang tải bài viết...</div>
                                    ) : randomPosts.length > 0 ? (
                                        randomPosts.map((post, index) => (
                                            <motion.a
                                                key={post.postId}
                                                href={`/posts/${post.slug}`}
                                                className="flex gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors group"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                            >
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${post.thumbnail}`}
                                                    alt={post.title}
                                                    className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-lg flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                                                        <span className="text-[10px] sm:text-xs py-0.5 sm:py-1  text-green-700 rounded">
                                                            {post.author.authorName}
                                                        </span>
                                                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1  text-blue-700 rounded">
                                                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {post.title}
                                                    </h3>
                                                </div>
                                            </motion.a>
                                        ))
                                    ) : (
                                        <div className="text-gray-500 text-center py-8">Chưa có bài viết nào</div>
                                    )}
                                </motion.div>

                                {randomPosts.length > 0 && (
                                    <button className="w-full mt-4 sm:mt-6 text-blue-600 font-medium py-2 sm:py-3 text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-blue-50 rounded-lg transition-colors">
                                        Xem tất cả
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}