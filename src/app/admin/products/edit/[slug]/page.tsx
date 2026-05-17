"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import Toast from "@/components/ui/Toast";

import { useCategories } from "@/hooks/useCategory";
import { useBrands } from "@/hooks/useBrand";
import { useStores } from "@/hooks/useStore";
import { useProducts } from "@/hooks/useProduct";
import { useProductSpecs } from "@/hooks/useProductSpec";
import { useProductVariants } from "@/hooks/useVariant";
import { useRouter, useParams } from "next/navigation";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

// Animation variants
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function EditProductPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  // Hooks
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
  const { stores, loading: loadingStore } = useStores(100000);
  const { getProductBySlug, updateProduct } = useProducts();
  const { updateSpec } = useProductSpecs();
  const {
    variants: variantsHook,
    fetchByProductId,
    createVariant,
    updateVariant,
  } = useProductVariants();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  // Expansion states
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSpecExpanded, setIsSpecExpanded] = useState(true);
  const [isVariantExpanded, setIsVariantExpanded] = useState(true);

  const [spec, setSpec] = useState({
    specId: "",
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

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Load product data
  useEffect(() => {
    if (!slug) return;

    const loadProduct = async () => {
      try {
        const data = await getProductBySlug(
          Array.isArray(slug) ? slug[0] : slug,
        );
        if (!data) {
          showToast("error", "Sản phẩm không tồn tại");
          return;
        }

        setProduct(data);

        // Set basic info
        setProductName(data.proName || "");
        setDescription(data.description || "");

        // Xử lý brand và category - backend trả về object
        setSelectedBrand(data.brand?.brandId?.toString() || "");
        setSelectedCategory(data.category?.categoryId?.toString() || "");

        // Xử lý images - backend trả về List<String> hoặc List<{imageUrl, isCover}>
        let imageUrls: string[] = [];
        let coverIdx = 0;

        if (data.images && data.images.length > 0) {
          imageUrls = data.images
            .map((img: any) => (typeof img === "string" ? img : img.imageUrl))
            .filter(Boolean);

          coverIdx = data.images.findIndex(
            (img: any) =>
              typeof img === "object" && img !== null && img.isCover,
          );
        } else if (data.mainImage) {
          imageUrls = [data.mainImage];
        }

        setPreviews(imageUrls);
        setCoverIndex(coverIdx >= 0 ? coverIdx : 0);

        // Load specification - backend trả về trực tiếp trong response
        if (data.specification) {
          const specData = data.specification;
          setSpec({
            specId: specData.specId?.toString() || "",
            os: specData.os || "",
            display: specData.display || "",
            cpu: specData.cpu || "",
            gpu: specData.gpu || "",
            ram: specData.ram || "",
            rom: specData.rom || "",
            cameraFront: specData.cameraFront || "",
            cameraRear: specData.cameraRear || "",
            battery: specData.battery || "",
            weight: specData.weight || "",
            size: specData.size || "",
            sim: specData.sim || "",
            material: specData.material || "",
          });
        }

        // Load options (variants) - backend trả về trong variants array
        if (data.variants && data.variants.length > 0) {
          const loadedVariants = data.variants.map((option: any) => ({
            optionId: option.optionId,
            color: option.color || "",
            rom: option.rom || "",
            extraPrice: option.extraPrice || 0,
            isActive: option.isActive !== undefined ? option.isActive : true,
            storeId: option.warehouseId || null,
            quantity: option.quantity || 0,
            importPrice: option.importPrice || 0,
            salePrice: option.baseSalePrice || 0,
          }));

          setVariants(loadedVariants);
        } else {
          setVariants([
            {
              optionId: null,
              color: "Standard",
              rom: "Standard",
              extraPrice: 0,
              isActive: true,
              storeId: null,
              quantity: 0,
              importPrice: 0,
              salePrice: 0,
            },
          ]);
        }
      } catch (err: any) {
        showToast("error", err.message || "Lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  // Handle spec change
  const handleSpecChange = (field: keyof typeof spec, value: string) => {
    setSpec((prev) => ({ ...prev, [field]: value }));
  };

  // Handle files
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024,
    );
    setSelectedFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (index === coverIndex && previews.length > 1) setCoverIndex(0);
    else if (index < coverIndex) setCoverIndex((prev) => prev - 1);
  };

  const setCover = (index: number) => setCoverIndex(index);

  const updateVariantField = (index: number, key: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    );
  };

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      {
        color: "Standard",
        rom: "Standard",
        extraPrice: 0,
        isActive: true,
        storeId: null,
        quantity: 0,
        importPrice: 0,
        salePrice: 0,
      },
    ]);

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      showToast("error", "Sản phẩm phải có ít nhất 1 phiên bản");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle save (update)
  const handleSave = async () => {
    if (saving) return;

    if (!productName.trim())
      return showToast("error", "Vui lòng nhập tên sản phẩm");
    if (!selectedBrand) return showToast("error", "Vui lòng chọn thương hiệu");
    if (!selectedCategory) return showToast("error", "Vui lòng chọn danh mục");

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];

      if (!v.storeId) {
        showToast("error", `Phiên bản ${i + 1}: Vui lòng chọn cửa hàng`);
        return;
      }

      const importPrice = Number(v.importPrice);
      const salePrice = Number(v.salePrice);
      const quantity = Number(v.quantity);

      if (!v.salePrice) {
        showToast("error", `Phiên bản ${i + 1}: Vui lòng nhập giá bán`);
        return;
      }

      if (salePrice <= importPrice) {
        showToast("error", `Phiên bản ${i + 1}: Giá bán phải lớn hơn giá nhập`);
        return;
      }

      if (!v.quantity || quantity < 1) {
        showToast(
          "error",
          `Phiên bản ${i + 1}: Số lượng phải lớn hơn hoặc bằng 1`,
        );
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

      // Update product
      await updateProduct(
        Array.isArray(slug) ? slug[0] : slug,
        productPayload,
        selectedFiles,
      );

      // Update spec
      if (spec.specId) {
        const { specId, ...specData } = spec;
        await updateSpec(Number(specId), specData);
      }

      // Update variants (including inventory data)
      for (const v of variants) {
        let currentOptionId = v.optionId;

        const variantData = {
          color: v.color,
          rom: v.rom,
          extraPrice: Number(v.extraPrice),
          isActive: v.isActive,
          warehouseId: Number(v.storeId),
          quantity: Number(v.quantity),
          importPrice: Number(v.importPrice),
          baseSalePrice: Number(v.salePrice),
        };

        if (currentOptionId) {
          await updateVariant(currentOptionId, variantData as any);
        } else {
          await createVariant({
            proId: product.proId,
            ...variantData,
          } as any);
        }
      }

      showToast("success", "Cập nhật sản phẩm thành công");
      setTimeout(() => router.push("/admin/products"), 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Lỗi khi lưu sản phẩm";
      showToast("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

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
              Chỉnh sửa sản phẩm
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chỉnh sửa sản phẩm
          </h1>
          <p className="text-gray-600">{productName}</p>
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
                        brands?.length > 0 &&
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
                        categories?.length > 0 &&
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
                    <div className="rounded-xl border border-gray-300 bg-gray-50 overflow-hidden">
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
                        Hình ảnh sản phẩm ({previews.length})
                      </p>
                      {previews.length > 0 && (
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

                              {coverIndex === index && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
                                >
                                  BÌA
                                </motion.div>
                              )}

                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
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

          {/* Phiên bản, Giá & Tồn kho */}
          <motion.div
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <p className="text-gray-900 dark:text-white text-lg font-semibold">
                Giá & Tồn kho
              </p>
              <motion.button
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
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <motion.div
                      key={index}
                      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 p-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <label className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                              Kho hàng
                            </p>
                            <select
                              value={variant.storeId || ""}
                              onChange={(e) =>
                                updateVariantField(
                                  index,
                                  "storeId",
                                  Number(e.target.value),
                                )
                              }
                              disabled={loadingStore}
                              className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 px-4 text-sm transition-all"
                            >
                              <option value="">
                                {loadingStore
                                  ? "Đang tải cửa hàng..."
                                  : stores.length === 0
                                    ? "Chưa có cửa hàng"
                                    : "Chọn cửa hàng"}
                              </option>
                              {!loadingStore &&
                                stores?.length > 0 &&
                                stores.map((store) => (
                                  <option
                                    key={store.storeId}
                                    value={store.storeId}
                                  >
                                    {store.storeName}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <label className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                              Giá nhập ($)
                            </p>
                            <input
                              type="number"
                              value={variant.importPrice}
                              onChange={(e) =>
                                updateVariantField(
                                  index,
                                  "importPrice",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-4 text-sm transition-all"
                              placeholder="Ví dụ: 950"
                            />
                          </label>
                          <label className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                              Giá bán gốc ($)
                            </p>
                            <input
                              type="number"
                              value={variant.salePrice}
                              onChange={(e) =>
                                updateVariantField(
                                  index,
                                  "salePrice",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-4 text-sm transition-all"
                              placeholder="Ví dụ: 1299"
                            />
                          </label>
                          <label className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                              Số lượng
                            </p>
                            <input
                              type="number"
                              value={variant.quantity}
                              onChange={(e) =>
                                updateVariantField(
                                  index,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 h-11 px-4 text-sm transition-all"
                              placeholder="Ví dụ: 150"
                            />
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
              onClick={() => router.push("/admin/products")}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-200/80 hover:bg-gray-300 text-gray-800 dark:text-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hủy
            </motion.button>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all bg-blue-600 ${
                saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
              whileHover={{ scale: saving ? 1 : 1.05 }}
              whileTap={{ scale: saving ? 1 : 0.95 }}
            >
              {saving ? "Đang lưu..." : "Cập nhật sản phẩm"}
            </motion.button>
          </motion.footer>
        </motion.div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
