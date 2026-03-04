"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Package, TrendingUp, X, ShoppingCart, CheckCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProduct';
import { useProductVariants } from '@/hooks/useVariant';
import { useWarehouses } from '@/hooks/useWarehouse';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import DecSection from '@/components/products/DecSection';
import ReviewSection from '@/components/rieview/ReviewSection';
import Footer from '@/components/ui/Footer';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';
import AddToCartModal from '@/components/ui/AddToCartModal';
import Toast from '@/components/ui/Toast';
import SuggestedProducts from '@/components/products/SuggestProductDetail';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [variantsWithPrices, setVariantsWithPrices] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { getProductBySlug } = useProducts();
  const { variants, fetchByProductId } = useProductVariants();
  const { getByOption } = useWarehouses();
  const { addToCart } = useCart();

  const { slug } = React.use(params);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setPageLoading(true);
        const productResponse = await getProductBySlug(slug);
        setProduct(productResponse);

        if (productResponse?.proId) {
          await fetchByProductId(productResponse.proId);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setPageLoading(false);
      }
    };

    if (slug) {
      loadProductData();
    }
  }, [slug, getProductBySlug, fetchByProductId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const loadAllVariantPrices = async () => {
      if (variants.length === 0) return;

      try {
        const variantsWithPricesData = await Promise.all(
          variants
            .filter(v => v.isActive)
            .map(async (variant) => {
              try {
                const warehouseData = await getByOption(variant.optionId);
                return {
                  ...variant,
                  price: warehouseData?.baseSalePrice || 0
                };
              } catch (error) {
                console.error(`Error loading price for variant ${variant.optionId}:`, error);
                return {
                  ...variant,
                  price: 0
                };
              }
            })
        );

        setVariantsWithPrices(variantsWithPricesData);

        const variantsWithValidPrice = variantsWithPricesData.filter(v => v.price > 0);

        if (variantsWithValidPrice.length > 0) {
          const lowestPriceVariant = variantsWithValidPrice.reduce((lowest, current) =>
            current.price < lowest.price ? current : lowest
          );

          if (lowestPriceVariant.rom?.toLowerCase() !== 'standard') {
            setSelectedStorage(lowestPriceVariant.rom);
          } else {
            setSelectedStorage(lowestPriceVariant.rom);
          }
          setSelectedColor(lowestPriceVariant.color);
        } else {
          const firstVariant = variants.find(v => v.isActive);
          if (firstVariant) {
            setSelectedStorage(firstVariant.rom);
            setSelectedColor(firstVariant.color);
          }
        }
      } catch (error) {
        console.error('Error loading variant prices:', error);
      }
    };

    loadAllVariantPrices();
  }, [variants, getByOption]);

  useEffect(() => {
    if (!selectedStorage || !selectedColor) return;

    const selectedOption = variants.find(
      v => v.rom === selectedStorage && v.color === selectedColor && v.isActive
    );

    if (selectedOption) {
      setSelectedOptionId(selectedOption.optionId);
    } else {
      setSelectedOptionId(null);
    }
  }, [selectedStorage, selectedColor, variants]);

  useEffect(() => {
    const loadWarehouseData = async () => {
      if (!selectedOptionId) {
        setCurrentPrice(0);
        setOriginalPrice(0);
        setStockQuantity(0);
        return;
      }

      try {
        const warehouseData = await getByOption(selectedOptionId);

        if (warehouseData) {
          const price = warehouseData.baseSalePrice || 0;
          setCurrentPrice(price);
          setOriginalPrice(price);
        } else {
          setCurrentPrice(0);
          setOriginalPrice(0);
        }
      } catch (error) {
        console.error('Error loading warehouse data:', error);
        setCurrentPrice(0);
        setOriginalPrice(0);
        setStockQuantity(0);
      }
    };

    loadWarehouseData();
  }, [selectedOptionId, getByOption]);

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setToast({ type: 'error', message: 'Vui lòng đăng nhập để thêm vào giỏ hàng!' });
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }

    const hasNonStandardStorage = storageOptions.some(opt => opt.rom?.toLowerCase() !== 'standard');
    if (!selectedColor && hasNonStandardStorage && !selectedStorage) {
      setToast({ type: 'error', message: 'Vui lòng chọn màu sắc và dung lượng sản phẩm!' });
      return;
    }

    if (!selectedColor) {
      setToast({ type: 'error', message: 'Vui lòng chọn màu sắc!' });
      return;
    }

    // Kiểm tra phải chọn dung lượng (nếu có dung lượng không phải 'standard')

    if (hasNonStandardStorage && !selectedStorage) {
      setToast({ type: 'error', message: 'Vui lòng chọn dung lượng!' });
      return;
    }

    if (!selectedOptionId) {
      alert('Vui lòng chọn đầy đủ thông tin sản phẩm!');
      return;
    }

    if (product.totalQuantity === 0) {
      setToast({ type: 'error', message: 'Sản phẩm hiện đã hết hàng!' });
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart({
        optionId: selectedOptionId,
        quantity: 1
      });

      // Hiển thị modal thành công
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleViewCart = () => {
    setShowSuccessModal(false);
    router.push('/cart');
  };

  const handleBuyNow = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setToast({ type: 'error', message: 'Vui lòng đăng nhập để mua sản phẩm!' });
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }

    const hasNonStandardStorage = storageOptions.some(opt => opt.rom?.toLowerCase() !== 'standard');
    if (!selectedColor && hasNonStandardStorage && !selectedStorage) {
      setToast({ type: 'error', message: 'Vui lòng chọn màu sắc và dung lượng sản phẩm!' });
      return;
    }

    if (!selectedColor) {
      setToast({ type: 'error', message: 'Vui lòng chọn màu sắc!' });
      return;
    }
    
    // Kiểm tra đã chọn đầy đủ thông tin sản phẩm
    if (!selectedOptionId || !product) {
      setToast({ type: 'error', message: 'Vui lòng chọn đầy đủ thông tin sản phẩm!' });
      return;
    }

    // Kiểm tra tồn kho
    if (product.totalQuantity === 0) {
      setToast({ type: 'error', message: 'Sản phẩm hiện đã hết hàng!' });
      return;
    }

    try {
      // Lấy thông tin người dùng từ localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setToast({ type: 'error', message: 'Vui lòng đăng nhập để tiếp tục!' });
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }

      const user = JSON.parse(userStr);

      // Tạo dữ liệu checkout với sản phẩm hiện tại
      const checkoutData = {
        customerInfo: {
          fullName: user.fullName || '',
          phone: user.phone || ''
        },
        products: [
          {
            itemId: Date.now(), // Tạo ID duy nhất
            productName: product.proName,
            productSlug: slug,
            coverImage: images.length > 0 ? images[0].imageUrl : '',
            rom: selectedStorage || '',
            color: selectedColor || '',
            quantity: 1,
            price: currentPrice,
            totalPrice: currentPrice,
            optionId: selectedOptionId
          }
        ],
        totalAmount: currentPrice
      };

      // Xóa dữ liệu checkout cũ (nếu có) trước khi lưu dữ liệu mới
      sessionStorage.removeItem('checkoutData');

      // Lưu vào sessionStorage
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

      // Verify dữ liệu đã được lưu thành công
      const savedData = sessionStorage.getItem('checkoutData');
      if (!savedData) {
        throw new Error('Không thể lưu dữ liệu checkout');
      }

      // Hiển thị toast thành công
      setToast({ type: 'success', message: 'Đang chuyển đến trang thanh toán...' });

      // Chuyển trang sau một khoảng thời gian ngắn
      setTimeout(() => {
        router.push('/checkout');
      }, 800);

    } catch (error) {
      console.error('Error preparing checkout:', error);
      setToast({ type: 'error', message: 'Có lỗi xảy ra. Vui lòng thử lại!' });
    }
  };

  const storageOptions = Array.from(
    new Map(
      variants
        .filter(v => v.rom && v.isActive)
        .map(v => [v.rom, v])
    ).values()
  );

  const colorOptions = Array.from(
    new Map(
      variants
        .filter(v => v.color && v.isActive)
        .map(v => [v.color, v])
    ).values()
  );

  const isStorageAvailable = (rom: string | null | undefined): boolean => {
    if (!rom) return false;
    if (!selectedColor) return true;
    return variants.some(v =>
      v.rom === rom &&
      v.color === selectedColor &&
      v.isActive
    );
  };

  const isColorAvailable = (color: string | null | undefined): boolean => {
    if (!color) return false;
    if (!selectedStorage) return true;
    return variants.some(v =>
      v.color === color &&
      v.rom === selectedStorage &&
      v.isActive
    );
  };

  const colorMap: Record<string, string> = {
    'xanh': '#4A90E2',
    'đen': '#000000',
    'trắng': '#FFFFFF',
    'đỏ': '#EF4444',
    'vàng': '#F59E0B',
    'tím': '#8B5CF6',
    'xám': '#6B7280',
    'hồng': '#EC4899',
    "titan tự nhiên": "#B0B4B8",
    "titan xanh": "#6C7A8C",
    "titan trắng": "#E4E7EB",
    "titan đen": "#3D3F43",
  };

  const getColorHex = (color?: string | null): string => {
    if (!color) return '#9CA3AF';
    const normalized = color.trim().toLowerCase();
    return colorMap[normalized] || '#9CA3AF';
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getDiscountPercent = () => {
    if (!originalPrice || !currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const images = product?.images || [];
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  // Get current product image for modal
  const currentProductImage = images.length > 0
    ? `${process.env.NEXT_PUBLIC_API_URL}${images[0].imageUrl}`
    : '';

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Không tìm thấy sản phẩm</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <AddToCartModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewCart={handleViewCart}
        productName={product.proName}
        productImage={currentProductImage}
        price={currentPrice}
      />

      <div className="min-h-screen bg-white">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 overflow-x-auto">
              <span>Trang chủ</span>
              <span>/</span>
              <span>Điện thoại</span>
              <span>/</span>
              <span>{product.category.categoryName}</span>
              <span>/</span>
              <span className="text-gray-600">{product.proName}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              <motion.div
                className="relative bg-white rounded-2xl overflow-hidden aspect-square"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {images.length > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImage}
                      src={`${process.env.NEXT_PUBLIC_API_URL}${images[currentImage].imageUrl}`}
                      alt={product.proName}
                      className="w-full h-full object-contain p-4 sm:p-8 lg:p-12"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 text-white -translate-y-1/2 bg-[#9D9EA1] backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-lg transition transform hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 text-white -translate-y-1/2 bg-[#9D9EA1] backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-lg transition transform hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="absolute bottom-4 left-4 bg-gray-800/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {currentImage + 1}/{images.length}
                    </div>
                  </>
                )}
              </motion.div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                <button className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg border-2 border-blue-500 flex flex-col items-center justify-center gap-1">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs">Nổi bật</span>
                </button>
                <button className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg border flex flex-col items-center justify-center gap-1">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded-full" />
                  <span className="text-[10px] sm:text-xs">Video</span>
                </button>
                {images.slice(0, 5).map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden ${currentImage === idx ? 'border-blue-500' : 'border-gray-200'}`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${img.imageUrl}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-4 lg:pt-10 lg:pl-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-xl sm:text-2xl font-bold mb-2">{product.proName}</h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">No.{product.proId?.toString().padStart(8, '0')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.rating?.toFixed(1) || 0}</span>
                    <span className="text-blue-600">({product.totalReviews || 0} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Đã bán: <span className="font-semibold text-green-600">{formatNumber(product.soldQuantity || 0)}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Còn: <span className="font-semibold text-blue-600">{formatNumber(product.totalQuantity || 0)}</span></span>
                  </div>
                </div>

                {currentPrice > 0 && (
                  <div className="py-1 mb-4">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl font-bold text-red-600">
                        {formatPrice(currentPrice)}
                      </span>
                      {originalPrice > currentPrice && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                            -{getDiscountPercent()}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {storageOptions.length > 0 && storageOptions.some(opt => opt.rom?.toLowerCase() !== 'standard') && (
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <div className="text-sm font-semibold">Dung lượng:</div>
                      <div className="flex gap-2">
                        {storageOptions
                          .filter(option => option.rom?.toLowerCase() !== 'standard')
                          .map((option) => {
                            const isAvailable = isStorageAvailable(option.rom);
                            return (
                              <button
                                key={option.optionId}
                                onClick={() => {
                                  if (isAvailable) {
                                    setSelectedStorage(selectedStorage === option.rom ? null : option.rom);
                                  }
                                }}
                                disabled={!isAvailable}
                                className={`relative px-3 py-1.5 rounded-lg border text-sm transition-all ${selectedStorage === option.rom
                                  ? 'border-red-500'
                                  : isAvailable
                                    ? 'border-gray-200 hover:border-gray-300'
                                    : 'border-gray-200 opacity-40 cursor-not-allowed'
                                  }`}
                                style={selectedStorage === option.rom ? { border: '1px solid #ef4444' } : {}}
                              >
                                <span className={!isAvailable ? 'text-gray-400' : ''}>
                                  {option.rom}
                                </span>
                                {selectedStorage === option.rom && (
                                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {colorOptions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="text-sm font-semibold whitespace-nowrap pt-1.5 pr-6">Màu sắc:</div>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((option) => {
                          const isAvailable = isColorAvailable(option.color);
                          return (
                            <button
                              key={option.optionId}
                              onClick={() => {
                                if (isAvailable) {
                                  setSelectedColor(selectedColor === option.color ? null : option.color);
                                }
                              }}
                              disabled={!isAvailable}
                              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${selectedColor === option.color
                                ? 'border-red-500'
                                : isAvailable
                                  ? 'border-gray-200 hover:border-gray-300'
                                  : 'border-gray-200 opacity-40 cursor-not-allowed'
                                }`}
                              style={selectedColor === option.color ? { border: '1px solid #ef4444' } : {}}
                            >
                              <div
                                className={`w-5 h-5 rounded border ${!isAvailable ? 'opacity-50' : ''}`}
                                style={{ backgroundColor: getColorHex(option.color) }}
                              />
                              <span className={!isAvailable ? 'text-gray-400' : ''}>
                                {option.color}
                              </span>
                              {selectedColor === option.color && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Specs */}
                <motion.div
                  className="bg-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between px-4 sm:p-6 border-b">
                    <h3 className="font-bold text-base sm:text-lg">Thông số nổi bật</h3>
                    <button className="text-red-600 text-xs sm:text-sm border px-3 sm:px-4 py-1.5 rounded-full hover:bg-red-50 transition whitespace-nowrap"
                      style={{ border: '1px solid #ef4444' }}>
                      Xem tất cả
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
                    {product.specification ? (
                      <>
                        <div className="p-4 sm:p-6">
                          <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Kích thước màn hình</div>
                          <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <div className="font-bold text-lg sm:text-xl">
                              {product.specification?.display?.split('"')[0]}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Camera</div>
                          <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="font-bold text-lg sm:text-xl">{product.specification.cameraFront || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">RAM</div>
                          <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            <div className="font-bold text-lg sm:text-xl">{product.specification.ram || 'N/A'}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-1 sm:col-span-3 p-6 sm:p-8 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <div className="text-gray-600">
                            <div className="font-semibold text-base sm:text-lg mb-1">Sản phẩm phụ kiện</div>
                            <div className="text-xs sm:text-sm">Thông số kỹ thuật không áp dụng cho sản phẩm này</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Product Policy */}
                <motion.div
                  className="bg-white mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between px-4 sm:p-6 border-b">
                    <h3 className="font-bold text-base sm:text-lg">Chính sách sản phẩm</h3>
                    <button className="text-blue-600 text-xs sm:text-sm hover:underline">
                      Tìm hiểu thêm
                    </button>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-xs sm:text-sm">Hàng chính hãng - Bảo hành 12 tháng</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                        <span className="text-xs sm:text-sm">Miễn phí giao hàng toàn quốc</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs sm:text-sm">Kỹ thuật viên hỗ trợ trực tuyến</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs sm:text-sm">Hỗ trợ cài đặt miễn phí</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    disabled={product.totalQuantity === 0 || addingToCart || !selectedOptionId}
                    className={`col-span-2 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition py-3 sm:py-0 ${product.totalQuantity === 0 || addingToCart || !selectedOptionId
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                      }`}
                    style={{ border: '1px solid #ef4444' }}
                  >
                    {addingToCart ? (
                      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600"></div>
                    ) : (
                      <svg className="w-7 h-7 sm:w-9 sm:h-9 text-red-500" viewBox="0 0 32 32" fill="red">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.33398 4.66699C3.7817 4.66699 3.33398 5.11471 3.33398 5.66699C3.33398 6.21928 3.7817 6.66699 4.33398 6.66699H5.07834C5.27901 6.66699 5.50314 6.75873 5.78429 7.27192C6.07381 7.80039 6.26865 8.50767 6.47625 9.26477L6.47897 9.2747L8.1571 14.9397L9.17109 18.6344C9.60812 20.2269 11.0557 21.3307 12.707 21.3307H20.6378C22.2756 21.3307 23.7148 20.2446 24.1639 18.6696L26.6009 10.1241C26.9044 9.05955 26.105 8.00033 24.9981 8.00033H8.33505C8.28964 8.00033 8.24474 8.00211 8.20041 8.0056C8.03675 7.45123 7.82754 6.83891 7.53831 6.31098C7.10442 5.51898 6.34563 4.66699 5.07834 4.66699H4.33398ZM14.6673 25.3337C14.6673 26.8064 13.4734 28.0003 12.0007 28.0003C10.5279 28.0003 9.33398 26.8064 9.33398 25.3337C9.33398 23.8609 10.5279 22.667 12.0007 22.667C13.4734 22.667 14.6673 23.8609 14.6673 25.3337ZM24.0007 25.3337C24.0007 26.8064 22.8067 28.0003 21.334 28.0003C19.8612 28.0003 18.6673 26.8064 18.6673 25.3337C18.6673 23.8609 19.8612 22.667 21.334 22.667C22.8067 22.667 24.0007 23.8609 24.0007 25.3337ZM16.75 10C17.0922 10 17.3696 10.2774 17.3696 10.6196V14.1304H20.8804C21.2226 14.1304 21.5 14.4078 21.5 14.75C21.5 15.0922 21.2226 15.3696 20.8804 15.3696H17.3696V18.8804C17.3696 19.2226 17.0922 19.5 16.75 19.5C16.4078 19.5 16.1304 19.2226 16.1304 18.8804V15.3696H12.6196C12.2774 15.3696 12 15.0922 12 14.75C12 14.4078 12.2774 14.1304 12.6196 14.1304H16.1304V10.6196C16.1304 10.2774 16.4078 10 16.75 10Z" />
                      </svg>
                    )}
                  </motion.button>

                  {/* Buy Now Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    disabled={product.totalQuantity === 0 || !selectedOptionId}
                    className={`col-span-5 bg-red-600 text-white rounded-lg py-3 font-bold text-base sm:text-lg hover:bg-red-700 transition shadow-lg ${product.totalQuantity === 0 || !selectedOptionId ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {product.totalQuantity === 0 ? 'Hết hàng' : 'Mua ngay'}
                  </motion.button>

                  {/* Installment Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={product.totalQuantity === 0}
                    className={`col-span-5 bg-gray-900 text-white rounded-lg py-3 font-semibold hover:bg-gray-800 transition ${product.totalQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-xs sm:text-sm">Trả góp</div>
                    <div className="text-[10px] sm:text-xs"></div>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <DecSection productSlug={slug} />
      </div>
      <div className="bg-[#F3F4F6]">
        {product?.proId && <ReviewSection proId={product.proId} />}
        <SuggestedProducts
          categoryId={product.category.categoryId}
          excludeProductId={product.proId}
          title="Sản phẩm tương tự"
        />
      </div>
      <Footer />
      <ScrollToTopButton />
      <Toast toast={toast} />
    </>
  );
}