"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBanners } from '@/hooks/useBanner';

export default function HeroBannerSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [direction, setDirection] = useState(1);

    const { banners, loading } = useBanners(100); // Lấy nhiều banner để filter

    // Filter banners
    const topBanner = banners.find(b => b.position === 'SUPTOP' && b.isActive);
    const bottomBanners = banners.filter(b => b.position === 'TOP' && b.isActive);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto slide
    useEffect(() => {
        if (bottomBanners.length === 0) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(interval);
    }, [currentIndex, isMobile, bottomBanners.length]);

    const visibleCount = isMobile ? 1 : 2;

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => {
            const newIndex = prev + 1;
            if (newIndex > bottomBanners.length - visibleCount) {
                return 0;
            }
            return newIndex;
        });
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => {
            const newIndex = prev - 1;
            if (newIndex < 0) {
                return bottomBanners.length - visibleCount;
            }
            return newIndex;
        });
    };

    const slideVariants = {
        enter: (direction: any) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: any) => ({
            x: direction > 0 ? '-100%' : '100%',
            opacity: 0
        })
    };

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-6 px-6">
                <div className="mb-4 bg-gray-200 animate-pulse h-72 md:h-80 lg:h-[370px] rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-200 animate-pulse h-56 rounded-2xl"></div>
                    <div className="bg-gray-200 animate-pulse h-56 rounded-2xl hidden md:block"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="w-full max-w-7xl mx-auto py-6 px-8">
                {/* Top Banner (SUPTOP) */}
                {topBanner && (
                    <div className="mb-4 overflow-hidden bg-gray-100 rounded-lg">
                        <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${topBanner.imageUrl ?? '/default-image.png'}`}
                            alt={topBanner.title || 'Top Banner'}
                            className="w-full h-72 md:h-80 lg:h-[370px] object-contain cursor-pointer"
                            onClick={() => {
                                if (topBanner.linkTarget) {
                                    window.open(topBanner.linkTarget, '_blank');
                                }
                            }}
                        />
                    </div>
                )}

                {/* Bottom Slider (TOP banners) */}
                {bottomBanners.length > 0 && (
                    <div className="relative overflow-hidden">
                        {isMobile ? (
                            // Mobile: 1 ảnh
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={`mobile-${currentIndex}`}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="rounded-2xl overflow-hidden cursor-pointer"
                                    onClick={() => {
                                        if (bottomBanners[currentIndex]?.linkTarget) {
                                            window.open(bottomBanners[currentIndex].linkTarget, '_blank');
                                        }
                                    }}
                                >
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${bottomBanners[currentIndex]?.imageUrl}`}
                                        alt={bottomBanners[currentIndex]?.title || `Slide ${currentIndex + 1}`}
                                        className="w-full h-42 lg:h-68 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 relative">
                                {/* Card 1 */}
                                <div className="relative overflow-hidden rounded-2xl">
                                    <AnimatePresence mode="popLayout" custom={direction}>
                                        <motion.div
                                            key={`card1-${currentIndex}`}
                                            custom={direction}
                                            variants={slideVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.2 }
                                            }}
                                            className="cursor-pointer rounded-2xl overflow-hidden"
                                            onClick={() => {
                                                if (bottomBanners[currentIndex]?.linkTarget) {
                                                    window.open(bottomBanners[currentIndex].linkTarget, '_blank');
                                                }
                                            }}
                                        >
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${bottomBanners[currentIndex]?.imageUrl}`}
                                                alt={bottomBanners[currentIndex]?.title || `Slide ${currentIndex + 1}`}
                                                className="w-full h-56 lg:h-50 object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Card 2 */}
                                {bottomBanners[currentIndex + 1] && (
                                    <div className="relative overflow-hidden rounded-2xl">
                                        <AnimatePresence mode="popLayout" custom={direction}>
                                            <motion.div
                                                key={`card2-${currentIndex + 1}`}
                                                custom={direction}
                                                variants={slideVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                transition={{
                                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                                    opacity: { duration: 0.2 }
                                                }}
                                                className="cursor-pointer rounded-2xl overflow-hidden"
                                                onClick={() => {
                                                    const target = bottomBanners[currentIndex + 1]?.linkTarget ?? undefined;
                                                    if (target) {
                                                        window.open(target, '_blank');
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${bottomBanners[currentIndex + 1]?.imageUrl}`}
                                                    alt={bottomBanners[currentIndex + 1]?.title || `Slide ${currentIndex + 2}`}
                                                    className="w-full h-56 lg:h-50 object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons - Chỉ hiện khi có nhiều hơn visibleCount */}
                        {bottomBanners.length > visibleCount && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft size={24} className="text-gray-800" />
                                </button>

                                <button
                                    onClick={nextSlide}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
                                    aria-label="Next slide"
                                >
                                    <ChevronRight size={24} className="text-gray-800" />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Message khi không có banner */}
                {!loading && bottomBanners.length === 0 && !topBanner && (
                    <div className="text-center py-12 text-gray-500">
                        Chưa có banner nào được kích hoạt
                    </div>
                )}
            </div>
        </div>
    );
}