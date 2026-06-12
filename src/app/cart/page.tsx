"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, Gift, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useProductVariants } from "@/hooks/useVariant";
import Toast from "@/components/ui/Toast";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";

interface EnrichedCartItem {
  itemId: number;
  quantity: number;
  isChecked: boolean;
  optionId: number;
  productName: string;
  productSlug: string;
  coverImage: string;
  rom: string;
  color: string;
  baseSalePrice: number;
  availableQuantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    total,
    loading: cartLoading,
    itemCount,
    updateQuantity,
    updateItemCheck,
    updateAllItemsCheck,
    removeItem,
    clearCart,
  } = useCart();
  const { getProductByOptionId } = useProductVariants();

  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [tempQuantities, setTempQuantities] = useState<{
    [key: number]: string;
  }>({});

  // Load chi tiết cho từng cart item
  useEffect(() => {
    const loadItemDetails = async () => {
      if (cartLoading || items.length === 0) {
        setEnrichedItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const enrichedData = await Promise.all(
          items.map(async (item) => {
            try {
              if (!item.option?.optionId) {
                throw new Error("Option ID not found");
              }
              const product = await getProductByOptionId(item.option.optionId);
              const coverImage = (() => {
                if (product.images && product.images.length > 0) {
                  if (typeof product.images[0] === "string")
                    return product.images[0];
                  return (
                    product.images.find((img: any) => img.isCover)?.imageUrl ||
                    product.images[0]?.imageUrl ||
                    ""
                  );
                }
                return (
                  product.mainImage ||
                  `https://via.placeholder.com/100?text=${product.proName}`
                );
              })();

              const baseSalePrice = item.option?.baseSalePrice || 0;
              const availableQuantity = item.option?.quantity || 0;

              return {
                itemId: item.itemId,
                quantity: item.quantity,
                isChecked: item.isChecked || false,
                optionId: item.option?.optionId,
                productName: product.proName,
                productSlug: product.slug,
                coverImage,
                rom: item.option?.rom || "N/A",
                color: item.option?.color || "N/A",
                baseSalePrice,
                availableQuantity,
              };
            } catch (error) {
              console.error(`Error loading item ${item.itemId}:`, error);
              return {
                itemId: item.itemId,
                quantity: item.quantity,
                isChecked: item.isChecked || false,
                optionId: item.option?.optionId || 0,
                productName: item.option?.product?.proName || "Unknown Product",
                productSlug: item.option?.product?.slug || "",
                coverImage: `https://via.placeholder.com/100?text=Product`,
                rom: item.option?.rom || "N/A",
                color: item.option?.color || "N/A",
                baseSalePrice: 0,
                availableQuantity: 0,
              };
            }
          }),
        );

        setEnrichedItems(enrichedData);

        // Khởi tạo tempQuantities với giá trị hiện tại
        const initialTemp: { [key: number]: string } = {};
        enrichedData.forEach((item) => {
          initialTemp[item.itemId] = item.quantity.toString();
        });
        setTempQuantities(initialTemp);
      } catch (error) {
        console.error("Error enriching cart items:", error);
        showToast("error", "Không thể tải chi tiết giỏ hàng");
      } finally {
        setLoading(false);
      }
    };

    loadItemDetails();
  }, [items, cartLoading, getProductByOptionId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!loading && initialLoad) {
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, initialLoad]);

  const checkedItemsCount = enrichedItems.filter(
    (item) => item.isChecked,
  ).length;
  const selectAll =
    enrichedItems.length > 0 && checkedItemsCount === enrichedItems.length;

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  const handleUpdateQuantity = async (
    itemId: number,
    delta: number,
    currentQuantity: number,
    availableQuantity: number,
  ) => {
    const newQuantity = currentQuantity + delta;

    if (newQuantity < 1) {
      showToast("error", "Số lượng phải lớn hơn 0");
      return;
    }

    if (newQuantity > availableQuantity) {
      showToast("error", `Số lượng tối đa trong kho: ${availableQuantity}`);
      return;
    }

    try {
      await updateQuantity(itemId, newQuantity);
      setTempQuantities((prev) => ({
        ...prev,
        [itemId]: newQuantity.toString(),
      }));
      showToast("success", "Cập nhật số lượng thành công");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật số lượng";
      showToast("error", errorMessage);
    }
  };

  const handleQuantityChange = (itemId: number, value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setTempQuantities((prev) => ({ ...prev, [itemId]: value }));
    }
  };

  const handleQuantitySubmit = async (
    itemId: number,
    availableQuantity: number,
  ) => {
    const value = tempQuantities[itemId];
    const numValue = parseInt(value);

    if (value === "" || isNaN(numValue)) {
      const item = enrichedItems.find((i) => i.itemId === itemId);
      if (item) {
        setTempQuantities((prev) => ({
          ...prev,
          [itemId]: item.quantity.toString(),
        }));
      }
      return;
    }

    if (numValue < 1) {
      showToast("error", "Số lượng phải lớn hơn 0");
      const item = enrichedItems.find((i) => i.itemId === itemId);
      if (item) {
        setTempQuantities((prev) => ({
          ...prev,
          [itemId]: item.quantity.toString(),
        }));
      }
      return;
    }

    if (numValue > availableQuantity) {
      showToast("error", `Số lượng tối đa trong kho: ${availableQuantity}`);
      const item = enrichedItems.find((i) => i.itemId === itemId);
      if (item) {
        setTempQuantities((prev) => ({
          ...prev,
          [itemId]: item.quantity.toString(),
        }));
      }
      return;
    }

    const item = enrichedItems.find((i) => i.itemId === itemId);
    if (item && item.quantity === numValue) {
      return;
    }

    try {
      await updateQuantity(itemId, numValue);
      showToast("success", "Cập nhật số lượng thành công");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật số lượng";
      showToast("error", errorMessage);
      if (item) {
        setTempQuantities((prev) => ({
          ...prev,
          [itemId]: item.quantity.toString(),
        }));
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemId: number,
    availableQuantity: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQuantitySubmit(itemId, availableQuantity);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
      showToast("success", "Đã xóa sản phẩm khỏi giỏ hàng");
      // Không cần reload thủ công - useEffect sẽ tự động cập nhật khi items thay đổi
    } catch (error) {
      showToast("error", "Không thể xóa sản phẩm");
    }
  };

  const handleClearSelected = async () => {
    const checkedItems = enrichedItems.filter((item) => item.isChecked);
    if (checkedItems.length === 0) {
      showToast("error", "Vui lòng chọn sản phẩm cần xóa");
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc muốn xóa ${checkedItems.length} sản phẩm đã chọn?`,
      )
    ) {
      try {
        const deletePromises = checkedItems.map((item) =>
          removeItem(item.itemId),
        );
        await Promise.all(deletePromises);
        showToast("success", `Đã xóa ${checkedItems.length} sản phẩm`);
        // Không cần reload thủ công - useEffect sẽ tự động cập nhật khi items thay đổi
      } catch (error) {
        showToast("error", "Không thể xóa sản phẩm");
      }
    }
  };

  const toggleSelectItem = async (itemId: number) => {
    const item = enrichedItems.find((i) => i.itemId === itemId);
    if (!item) return;

    try {
      await updateItemCheck(itemId, !item.isChecked);
    } catch (error: any) {
      console.error("Toggle item error:", error);
      showToast(
        "error",
        error.response?.data?.message || "Không thể cập nhật trạng thái",
      );
    }
  };

  const toggleSelectAll = async () => {
    try {
      await updateAllItemsCheck(!selectAll);
    } catch (error: any) {
      console.error("Toggle all error:", error);
      showToast(
        "error",
        error.response?.data?.message || "Không thể cập nhật trạng thái",
      );
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const handleCheckout = () => {
    if (checkedItemsCount === 0) {
      showToast("error", "Vui lòng chọn sản phẩm để thanh toán");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      showToast("error", "Vui lòng đăng nhập để tiếp tục");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const selectedItems = enrichedItems.filter((item) => item.isChecked);

      const checkoutData = {
        customerInfo: {
          fullName: user.fullName || "",
          phone: user.phone || "",
        },
        products: selectedItems.map((item) => ({
          itemId: item.itemId,
          productName: item.productName,
          productSlug: item.productSlug,
          coverImage: item.coverImage,
          rom: item.rom,
          color: item.color,
          quantity: item.quantity,
          price: item.baseSalePrice,
          totalPrice: item.baseSalePrice * item.quantity,
          optionId: item.optionId,
        })),
        totalAmount: selectedTotal,
      };

      sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout error:", error);
      showToast("error", "Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const selectedTotal = enrichedItems
    .filter((item) => item.isChecked)
    .reduce((sum, item) => sum + item.baseSalePrice * item.quantity, 0);

  const cartTotal = enrichedItems.reduce(
    (sum, item) => sum + item.baseSalePrice * item.quantity,
    0,
  );

  if (initialLoad || loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (enrichedItems.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F3F4F6]">
          <Toast toast={toast} />
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600">
                <Link href="/" className="text-blue-600 hover:underline">
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="text-black">Giỏ hàng</span>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 py-20 text-center"
          >
            <div className="bg-white rounded-lg p-12 shadow-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Gift className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-medium text-gray-800 mb-2"
              >
                Giỏ hàng trống
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </motion.p>
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tiếp tục mua sắm
              </motion.a>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F3F4F6]">
        <Toast toast={toast} />
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 overflow-x-auto">
              <Link href="/" className="text-blue-600 hover:underline">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-black">Giỏ hàng</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-4 flex items-center justify-between"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    Chọn tất cả ({enrichedItems.length})
                  </span>
                </label>
                <button
                  onClick={handleClearSelected}
                  disabled={checkedItemsCount === 0}
                  className="text-red-500 hover:text-red-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                  {checkedItemsCount > 0 && (
                    <span className="text-sm">({checkedItemsCount})</span>
                  )}
                </button>
              </motion.div>

              <AnimatePresence>
                {enrichedItems.map((item, index) => (
                  <motion.div
                    key={item.itemId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg p-4"
                  >
                    <div className="flex gap-4">
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        onChange={() => toggleSelectItem(item.itemId)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <img
                        src={
                          item.coverImage
                            ? item.coverImage.startsWith("http")
                              ? item.coverImage
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${item.coverImage}`
                            : "https://via.placeholder.com/100?text=No+Image"
                        }
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-gray-800 font-medium mb-2">
                          {item.productName}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-gray-500">
                            {item.rom} - {item.color}
                          </span>
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex flex-col">
                            <span className="text-red-600 font-bold text-lg">
                              {formatPrice(item.baseSalePrice)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.itemId,
                                    -1,
                                    item.quantity,
                                    item.availableQuantity,
                                  )
                                }
                                disabled={loading || item.quantity <= 1}
                                className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                −
                              </button>
                              <input
                                type="text"
                                value={
                                  tempQuantities[item.itemId] || item.quantity
                                }
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.itemId,
                                    e.target.value,
                                  )
                                }
                                onBlur={() =>
                                  handleQuantitySubmit(
                                    item.itemId,
                                    item.availableQuantity,
                                  )
                                }
                                onKeyDown={(e) =>
                                  handleKeyDown(
                                    e,
                                    item.itemId,
                                    item.availableQuantity,
                                  )
                                }
                                disabled={loading}
                                className="w-12 h-8 text-center border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.itemId,
                                    1,
                                    item.quantity,
                                    item.availableQuantity,
                                  )
                                }
                                disabled={
                                  loading ||
                                  item.quantity >= item.availableQuantity
                                }
                                className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.itemId)}
                                disabled={loading}
                                className="w-8 h-8 rounded hover:bg-red-50 flex items-center justify-center text-red-500 ml-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                            <span className="text-xs text-gray-500 text-right">
                              Kho: {item.availableQuantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 space-y-4"
              >
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Quà tặng</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2">
                    <Gift className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Chọn hoặc nhập ưu đãi
                    </span>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 flex items-start gap-2 mt-4 mb-4">
                    <span className="text-2xl">⚡</span>
                    <span className="text-sm text-gray-700">
                      Đăng ký thành viên để kích hoạt điểm thưởng
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between mb-4 cursor-pointer"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <h3 className="font-medium text-gray-800">
                      Thông tin đơn hàng
                    </h3>
                    <motion.div
                      animate={{ rotate: showDetails ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Tổng tiền giỏ hàng
                          </span>
                          <span className="text-gray-800">
                            {formatPrice(cartTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tổng khuyến mãi</span>
                          <span className="text-gray-800">0đ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Voucher</span>
                          <span className="text-gray-800">0đ</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Cần thanh toán</span>
                      <span className="text-2xl font-bold text-red-600">
                        {formatPrice(selectedTotal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Điểm thưởng</span>
                      <span className="text-yellow-500">⚡+0</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: checkedItemsCount > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: checkedItemsCount > 0 ? 0.98 : 1 }}
                    disabled={checkedItemsCount === 0 || loading}
                    onClick={handleCheckout}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium mt-4 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Đang xử lý..."
                      : `Xác nhận đơn (${checkedItemsCount})`}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}
