"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCategories } from "@/hooks/useCategory";
import { useBrands } from "@/hooks/useBrand";
import { useStores } from "@/hooks/useStore";
import { useProducts } from "@/hooks/useProduct";
import { useProductSpecs } from "@/hooks/useProductSpec";
import { useProductVariants } from "@/hooks/useVariant";
import Toast from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

export default function AddProductPage() {
  const router = useRouter();
  const {
    categories,
    loading: loadingCat,
    error: errorCat,
  } = useCategories(100000);
  const {
    brands,
    loading: loadingBrand,
    error: errorBrand,
  } = useBrands(100000);
  const {
    stores,
    loading: loadingStore,
    error: errorStore,
  } = useStores(100000);
  const { createProduct } = useProducts();
  const { createSpec } = useProductSpecs();
  const { createVariant } = useProductVariants();
  const [saving, setSaving] = useState(false);
  const [productName, setProductName] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSpecExpanded, setIsSpecExpanded] = useState(false);
  const [isVariantExpanded, setIsVariantExpanded] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [spec, setSpec] = useState({
    os: "",
    display: "",
    cpu: "",
    gpu: "",
    ram: "",
    rom: "",
    cameraFront: "",
    cameraRear: "",
    battery: "",
    weight: "",
    size: "",
    sim: "",
    material: "",
  });
  const [variantSectionRef, setVariantSectionRef] =
    useState<HTMLDivElement | null>(null);

  const handleSpecChange = (field: keyof typeof spec, value: string) => {
    setSpec((prev) => ({ ...prev, [field]: value }));
  };

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Hàm tiện lợi để show toast
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000); // 3 giây tự ẩn
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        type: "tween",
      },
    },
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) return false;
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} vượt quá 10MB`);
        return false;
      }
      return true;
    });

    // Thêm files mới vào danh sách
    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Tạo preview cho các file mới
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));

    // Cập nhật cover index nếu ảnh bị xóa
    if (index === coverIndex && previews.length > 1) {
      setCoverIndex(0);
    } else if (index < coverIndex) {
      setCoverIndex((prev) => prev - 1);
    }
  };

  const setCover = (index: number) => {
    setCoverIndex(index);
  };

  const [variants, setVariants] = useState([
    {
      color: "Standard",
      colorCode: "#000000",
      rom: "Standard",
      extraPrice: "0",
      isActive: true,
      storeId: null,
      quantity: "",
      importPrice: "",
      salePrice: "",
    },
  ]);



  const updateVariant = (index: number, key: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        color: "Standard",
        colorCode: "#000000",
        rom: "Standard",
        extraPrice: "0",
        isActive: true,
        storeId: null,
        quantity: "",
        importPrice: "",
        salePrice: "",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToVariantSection = () => {
    if (variantSectionRef) {
      variantSectionRef.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      // Mở rộng section nếu đang đóng
      if (!isVariantExpanded) {
        setIsVariantExpanded(true);
      }
    }
  };

  const handleSave = async () => {
    if (saving) return;

    if (!productName.trim()) {
      showToast("error", "Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!selectedBrand) {
      showToast("error", "Vui lòng chọn thương hiệu");
      return;
    }
    if (!selectedCategory) {
      showToast("error", "Vui lòng chọn danh mục");
      return;
    }
    if (variants.length === 0) {
      showToast("error", "Vui lòng thêm ít nhất 1 phiên bản sản phẩm");
      scrollToVariantSection();
      return;
    }

    // Kiểm tra từng biến thể
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];

      if (!v.storeId) {
        showToast("error", `Phiên bản ${i + 1}: Vui lòng chọn cửa hàng`);
        scrollToVariantSection();
        return;
      }

      const importPrice = Number(v.importPrice);
      const salePrice = Number(v.salePrice);
      const quantity = Number(v.quantity);

      if (!v.salePrice) {
        showToast("error", `Phiên bản ${i + 1}: Vui lòng nhập giá bán`);
        scrollToVariantSection();
        return;
      }

      if (salePrice <= importPrice) {
        showToast("error", `Phiên bản ${i + 1}: Giá bán phải lớn hơn giá nhập`);
        scrollToVariantSection();
        return;
      }

      if (
        v.quantity === undefined ||
        v.quantity === null ||
        isNaN(quantity) ||
        quantity < 0
      ) {
        showToast(
          "error",
          `Phiên bản ${i + 1}: Số lượng phải lớn hơn hoặc bằng 0`,
        );
        scrollToVariantSection();
        return;
      }
    }

    try {
      setSaving(true);

      const productPayload = {
        proName: productName.trim(),
        description,
        brandId: selectedBrand,
        catId: selectedCategory,
        coverIndex,
      };

      const productRes = await createProduct(productPayload, selectedFiles);
      const proId = productRes?.proId;

      if (!proId) throw new Error("Không lấy được ID sản phẩm");

      await createSpec({ proId, ...spec });

      for (const v of variants) {
        const variantPayload = {
          proId,
          color: v.color,
          colorCode: v.colorCode || "#000000",
          rom: v.rom,
          extraPrice: Number(v.extraPrice) || 0,
          isActive: v.isActive,
          warehouseId: Number(v.storeId),
          quantity: Number(v.quantity),
          importPrice: Number(v.importPrice),
          baseSalePrice: Number(v.salePrice),
        };

        await createVariant(variantPayload as any);
      }

      showToast("success", "Thêm sản phẩm thành công");
      setTimeout(() => router.push("/admin/products"), 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đã xảy ra lỗi khi lưu sản phẩm";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Link
              href={"/admin"}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href={"/admin/products"}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Thêm sản phẩm mới
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Thêm sản phẩm mới
          </h1>
        </motion.header>

        <motion.div
          className="flex flex-col gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Thông tin cơ bản */}
          <motion.div
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <p className="text-gray-900 dark:text-white text-lg font-semibold">
                Thông tin cơ bản
              </p>
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </motion.button>
            </div>

            <motion.div
              className="overflow-hidden"
              initial={false}
              animate={{ height: isExpanded ? "auto" : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Tên sản phẩm
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: Galaxy S24 Ultra"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </label>

                  {/* Thương hiệu */}
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Thương hiệu
                    </p>

                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      disabled={loadingBrand}
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 px-4 text-sm transition-all"
                    >
                      <option value="">
                        {loadingBrand ? "Đang tải..." : "Chọn thương hiệu"}
                      </option>

                      {!loadingBrand &&
                        !errorBrand &&
                        brands.map((brand) => (
                          <option key={brand.brandId} value={brand.brandId}>
                            {brand.brandName}
                          </option>
                        ))}
                    </select>

                    {errorBrand && (
                      <p className="text-sm text-red-500 mt-1">{errorBrand}</p>
                    )}
                  </label>

                  {/* Danh mục */}
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Danh mục
                    </p>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={loadingCat}
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 px-4 text-sm transition-all"
                    >
                      <option value="">
                        {loadingCat ? "Đang tải..." : "Chọn danh mục"}
                      </option>

                      {!loadingCat &&
                        !errorCat &&
                        categories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.categoryName}
                          </option>
                        ))}
                    </select>

                    {errorCat && (
                      <p className="text-sm text-red-500 mt-1">{errorCat}</p>
                    )}
                  </label>

                  {/* Mô tả */}
                  <div className="flex flex-col col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Mô tả
                    </p>
                    <div className="rounded-xl border border-gray-300  bg-gray-50 overflow-hidden">
                      <RichTextEditor
                        value={description}
                        onChange={setDescription}
                      />
                    </div>
                  </div>

                  {/* Hình ảnh sản phẩm */}
                  <div className="flex flex-col col-span-2">
                    <div className="flex items-center justify-between pb-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hình ảnh sản phẩm ({selectedFiles.length})
                      </p>
                      {selectedFiles.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Nhấn <span className="text-yellow-500">⭐</span> để
                          chọn ảnh bìa
                        </p>
                      )}
                    </div>

                    {/* Upload area */}
                    <motion.label
                      htmlFor="images"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500 transition-colors mb-4"
                    >
                      <svg
                        className="w-10 h-10 text-gray-400 mb-2"
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
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Kéo thả hoặc{" "}
                        <span className="font-semibold text-blue-600">
                          chọn nhiều tệp
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, GIF ≤ 10MB mỗi file
                      </p>
                    </motion.label>

                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFiles}
                    />

                    {/* Preview grid */}
                    {previews.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        <AnimatePresence>
                          {previews.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                                coverIndex === index
                                  ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                                  : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                              }`}
                            >
                              <img
                                src={
                                  (preview || "").startsWith("data:")
                                    ? preview
                                    : (preview || "").startsWith("http")
                                      ? preview
                                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${preview || ""}`
                                }
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover"
                              />

                              {/* Cover badge */}
                              {coverIndex === index && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
                                >
                                  BÌA
                                </motion.div>
                              )}

                              {/* Overlay với buttons */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                {/* Star button - Set as cover */}
                                <button
                                  type="button"
                                  onClick={() => setCover(index)}
                                  className={`p-1.5 rounded-full transition-all ${
                                    coverIndex === index
                                      ? "bg-yellow-500 text-white"
                                      : "bg-white/90 text-gray-700 hover:bg-yellow-500 hover:text-white"
                                  }`}
                                  title="Đặt làm ảnh bìa"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </button>

                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                  title="Xóa ảnh"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>

                              {/* Image number badge */}
                              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                {index + 1}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Thông số kỹ thuật */}
          <motion.div
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <p className="text-gray-900 dark:text-white text-lg font-semibold">
                Thông số kỹ thuật
              </p>
              <motion.button
                type="button"
                onClick={() => setIsSpecExpanded(!isSpecExpanded)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isSpecExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </motion.button>
            </div>

            <motion.div
              className="overflow-hidden"
              initial={false}
              animate={{ height: isSpecExpanded ? "auto" : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Bộ vi xử lý (CPU)
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: Apple A17 Pro"
                      value={spec.cpu}
                      onChange={(e) => handleSpecChange("cpu", e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Bộ nhớ RAM
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 8GB"
                      value={spec.ram}
                      onChange={(e) => handleSpecChange("ram", e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Bộ nhớ trong (ROM)
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 256GB"
                      value={spec.rom}
                      onChange={(e) => handleSpecChange("rom", e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Hệ điều hành (OS)
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: iOS 17"
                      value={spec.os}
                      onChange={(e) => handleSpecChange("os", e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Màn hình
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 6.7 inches, OLED"
                      value={spec.display}
                      onChange={(e) =>
                        handleSpecChange("display", e.target.value)
                      }
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Đồ họa (GPU)
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: Apple GPU 6 nhân"
                      value={spec.gpu}
                      onChange={(e) => handleSpecChange("gpu", e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Camera trước
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 12MP"
                      value={spec.cameraFront}
                      onChange={(e) =>
                        handleSpecChange("cameraFront", e.target.value)
                      }
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Camera sau
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 48MP + 12MP + 12MP"
                      value={spec.cameraRear}
                      onChange={(e) =>
                        handleSpecChange("cameraRear", e.target.value)
                      }
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Dung lượng pin
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 4441 mAh"
                      value={spec.battery}
                      onChange={(e) =>
                        handleSpecChange("battery", e.target.value)
                      }
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Trọng lượng
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 221g"
                      value={spec.weight}
                      onChange={(e) =>
                        handleSpecChange("weight", e.target.value)
                      }
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Kích thước
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 159.9 x 76.7 x 8.3 mm"
                      value={spec.size}
                      onChange={(e) => handleSpecChange("size", e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Thẻ SIM
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: 2 SIM (nano‑SIM và eSIM)"
                      value={spec.sim}
                      onChange={(e) => handleSpecChange("sim", e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                      Chất liệu
                    </p>
                    <input
                      className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-sm transition-all"
                      placeholder="Ví dụ: Khung Titan, mặt lưng kính"
                      value={spec.material}
                      onChange={(e) =>
                        handleSpecChange("material", e.target.value)
                      }
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Phiên bản, Giá & Tồn kho */}
          <motion.div
            ref={setVariantSectionRef}
            className=" scroll-mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <p className="text-gray-900 dark:text-white text-lg font-semibold">
                Danh sách các phiên bản (Màu sắc, Dung lượng & Tồn kho)
              </p>
              <motion.button
                type="button"
                onClick={() => setIsVariantExpanded(!isVariantExpanded)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isVariantExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </motion.button>
            </div>

            <motion.div
              className="overflow-hidden"
              initial={false}
              animate={{ height: isVariantExpanded ? "auto" : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="p-6">
                {/* 2. Bảng Biến thể rút gọn */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Danh sách biến thể hiện tại ({variants.length})
                    </h4>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-72">Màu sắc & Mã màu</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Dung lượng (ROM)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Kho hàng</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Giá nhập ($)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Giá bán ($)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Giá chênh ($)</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Tồn kho</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Trạng thái</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {variants.map((variant, index) => (
                          <tr key={index} className="hover:bg-gray-50/55 dark:hover:bg-gray-800/40">
                            <td className="px-3 py-2 text-gray-500 font-medium text-xs text-center">{index + 1}</td>
                            
                            <td className="px-2 py-1.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={variant.color}
                                  onChange={(e) => updateVariant(index, "color", e.target.value)}
                                  className="w-28 rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                                  placeholder="Tên màu sắc"
                                />
                                <input
                                  type="color"
                                  value={variant.colorCode || "#000000"}
                                  onChange={(e) => updateVariant(index, "colorCode", e.target.value)}
                                  className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer p-0 bg-transparent overflow-hidden"
                                />
                                <input
                                  type="text"
                                  value={variant.colorCode || "#000000"}
                                  onChange={(e) => updateVariant(index, "colorCode", e.target.value)}
                                  className="w-20 rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                                  placeholder="#000000"
                                />
                              </div>
                            </td>

                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={variant.rom}
                                onChange={(e) => updateVariant(index, "rom", e.target.value)}
                                className="w-full rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                                placeholder="Dung lượng"
                              />
                            </td>

                            <td className="px-2 py-1.5">
                              <select
                                value={variant.storeId || ""}
                                onChange={(e) => updateVariant(index, "storeId", Number(e.target.value))}
                                disabled={loadingStore}
                                className="w-full rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Chọn cửa hàng</option>
                                {!loadingStore && stores.map((store) => (
                                  <option key={store.storeId} value={store.storeId}>
                                    {store.storeName}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min="0"
                                value={variant.importPrice}
                                onChange={(e) => updateVariant(index, "importPrice", e.target.value)}
                                className="w-full rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </td>

                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min="0"
                                value={variant.salePrice}
                                onChange={(e) => updateVariant(index, "salePrice", e.target.value)}
                                className="w-full rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </td>

                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min="0"
                                value={variant.extraPrice}
                                onChange={(e) => updateVariant(index, "extraPrice", e.target.value)}
                                className="w-full rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </td>

                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                min="0"
                                value={variant.quantity}
                                onChange={(e) => updateVariant(index, "quantity", e.target.value)}
                                className="w-full rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </td>

                            <td className="px-2 py-1.5">
                              <select
                                value={variant.isActive ? "true" : "false"}
                                onChange={(e) => updateVariant(index, "isActive", e.target.value === "true")}
                                className="w-full rounded-lg text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="true">Kích hoạt</option>
                                <option value="false">Tạm ẩn</option>
                              </select>
                            </td>

                            <td className="px-2 py-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Xóa"
                              >
                                <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={addVariant}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-all border border-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm phiên bản thủ công
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Nút hành động */}
          <motion.footer
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-200/80 text-gray-800 dark:text-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hủy
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all bg-blue-700 ${saving ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700"}`}
              whileHover={{ scale: saving ? 1 : 1.05 }}
              whileTap={{ scale: saving ? 1 : 0.95 }}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </motion.button>
          </motion.footer>
        </motion.div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
