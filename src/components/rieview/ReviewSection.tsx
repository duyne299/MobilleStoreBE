"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReviews } from "@/hooks/useReview";
import Toast from "@/components/ui/Toast";

interface ReviewSectionProps {
  proId: number;
}

export default function ReviewSection({ proId }: ReviewSectionProps) {
  const {
    reviews = [],
    loading,
    error,
    fetchReviews,
    createReview,
    checkPurchase,
  } = useReviews();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(0); // 0 = comment, 1-5 = review
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; url: string; file: File }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  const reviewsPerPage = 5;

  // Fetch reviews when proId changes
  useEffect(() => {
    if (proId !== undefined && proId !== null) {
      fetchReviews({ proId });
    }
  }, [proId, fetchReviews]);

  // Check if user has purchased the product
  useEffect(() => {
    const fetchPurchaseStatus = async () => {
      if (proId !== undefined && proId !== null) {
        setCheckingPurchase(true);
        try {
          const purchased = await checkPurchase(proId);
          setHasPurchased(purchased);
        } catch (err) {
          console.error("Error checking purchase status:", err);
          setHasPurchased(false);
        } finally {
          setCheckingPurchase(false);
        }
      }
    };
    fetchPurchaseStatus();
  }, [proId, checkPurchase]);

  // Auto hide toast after 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Normalize incoming reviews to ensure consistent fields and types
  const normalizedReviews = useMemo(() => {
    return (reviews || []).map((r: any, idx: number) => {
      const ratingNum = typeof r.rating === "string" ? Number(r.rating) : r.rating ?? 0;
      const comment = r.comment ?? r.content ?? r.text ?? r.message ?? "";
      const id = r.reviewId ?? r.id ?? r._id ?? `review-${idx}`;
      const userName = r.user?.name ?? r.userName ?? r.username ?? "Người dùng";
      const userAvatar = r.user?.avatar ?? r.userAvatar ?? null;

      // Format time ago
      let timeAgo = r.timeAgo ?? "";
      if (!timeAgo && r.createdAt) {
        const date = new Date(r.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) timeAgo = "Vừa xong";
        else if (diffMins < 60) timeAgo = `${diffMins} phút trước`;
        else if (diffHours < 24) timeAgo = `${diffHours} giờ trước`;
        else if (diffDays < 7) timeAgo = `${diffDays} ngày trước`;
        else timeAgo = date.toLocaleDateString("vi-VN");
      }

      const likes = r.likes ?? 0;
      const images = r.images ?? [];

      return {
        ...r,
        id,
        rating: Number.isNaN(ratingNum) ? 0 : ratingNum,
        comment,
        userName,
        userAvatar,
        timeAgo,
        likes,
        images,
      };
    });
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (selectedFilter === "all") return normalizedReviews;
    if (selectedFilter === "comment") return normalizedReviews.filter((r) => r.rating === 0);
    const ratingNumber = Number(selectedFilter);
    if (!Number.isNaN(ratingNumber)) {
      return normalizedReviews.filter((r) => r.rating === ratingNumber);
    }
    return normalizedReviews;
  }, [normalizedReviews, selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage));
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

  // Handle image upload and create object URLs for preview
  const handleImageUpload = (e: any) => {
    const files: File[] = Array.from(e.target.files || []);

    // Limit to 5 images total
    const remainingSlots = 5 - uploadedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setToast({
        type: "error",
        message: `Chỉ có thể tải lên tối đa 5 ảnh. Đã bỏ qua ${files.length - remainingSlots} ảnh.`
      });
    }

    const newImages = filesToAdd.map((file: File) => {
      const id = Math.random().toString(36).substring(2, 11);
      return {
        id,
        url: URL.createObjectURL(file),
        file,
      };
    });

    setUploadedImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  // Remove image and revoke object URL to avoid memory leaks
  const removeImage = (id: string) => {
    setUploadedImages((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) {
        try {
          URL.revokeObjectURL(found.url);
        } catch (e) {
          // ignore
        }
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach((img) => {
        try {
          URL.revokeObjectURL(img.url);
        } catch (e) {
          // ignore
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitReview = async () => {
    // Validation
    if (!reviewText.trim()) {
      setToast({ type: "error", message: "Vui lòng nhập nội dung" });
      return;
    }

    // Check if trying to rate (rating > 0) without purchase
    if (selectedRating > 0 && !hasPurchased) {
      setToast({
        type: "error",
        message: "Bạn cần mua sản phẩm này trước khi đánh giá",
      });
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        proId,
        rating: selectedRating, // 0 = comment, 1-5 = review
        comment: reviewText,
      };

      const imageFiles = uploadedImages.map((img) => img.file);

      await createReview(reviewData, imageFiles.length > 0 ? imageFiles : undefined);

      // Refetch reviews to show the new one
      if (proId !== undefined && proId !== null) {
        try {
          await fetchReviews({ proId });
        } catch (e) {
          // ignore fetch error
        }
      }

      // Reset form
      setReviewText("");
      setSelectedRating(0);

      // Revoke object URLs
      uploadedImages.forEach((img) => {
        try {
          URL.revokeObjectURL(img.url);
        } catch (e) {
          // ignore
        }
      });
      setUploadedImages([]);

      setToast({
        type: "success",
        message: selectedRating > 0
          ? "Đánh giá của bạn đã được gửi!"
          : "Bình luận của bạn đã được gửi!",
      });

      // Jump to first page to show newest
      setCurrentPage(1);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Có lỗi xảy ra, vui lòng thử lại";
      setToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number) => (
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < count ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ))
  );

  const renderInteractiveStars = (current: number, onChange: (rating: number) => void) => (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          disabled={!hasPurchased}
          className={`text-2xl sm:text-3xl transition-transform ${hasPurchased ? "hover:scale-110 cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}
        >
          <span className={rating <= current ? "text-yellow-400" : "text-gray-300"}>
            ★
          </span>
        </button>
      ))}
      {current > 0 && (
        <button
          onClick={() => onChange(0)}
          className="ml-2 text-xs text-gray-500 hover:text-red-500 underline"
        >
          Xóa
        </button>
      )}
    </div>
  );

  const averageRating = useMemo(() => {
    const reviewsWithRating = normalizedReviews.filter((r: any) => r.rating > 0);
    return reviewsWithRating.length > 0
      ? (reviewsWithRating.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / reviewsWithRating.length).toFixed(1)
      : "0";
  }, [normalizedReviews]);

  const ratingDistribution = useMemo(() => {
    const dist: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    normalizedReviews.forEach((r: any) => {
      if (r.rating > 0 && dist[r.rating] !== undefined) dist[r.rating]++;
    });
    return dist;
  }, [normalizedReviews]);

  const totalReviews = normalizedReviews.filter((r: any) => r.rating > 0).length;
  const totalComments = normalizedReviews.filter((r: any) => r.rating === 0).length;

  return (
    <>
      <Toast toast={toast} />

      <div className="w-full max-w-7xl mx-auto sm:p-6 lg:px-8 bg-white rounded-2xl lg:pr-60">
        {/* Rating Summary */}
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Đánh giá và bình luận</h2>

        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center w-full lg:w-auto">
            <div className="text-4xl sm:text-5xl font-bold mb-2">{averageRating}</div>
            <div className="flex mb-2 text-xl sm:text-2xl">
              {renderStars(Math.floor(Number(averageRating)))}
            </div>
            <div className="text-sm text-gray-500 mb-1">{totalReviews} đánh giá</div>
            <div className="text-sm text-gray-500 mb-3">{totalComments} bình luận</div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 w-full">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 mb-2">
                <span className="text-xs sm:text-sm w-12 sm:w-8">{rating} ⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width:
                        totalReviews > 0
                          ? `${(ratingDistribution[rating] / totalReviews) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8 text-right">
                  {ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 border-b pb-4">
          <span className="font-semibold text-sm sm:text-base">
            tổng cộng {normalizedReviews.length}
          </span>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm border transition ${selectedFilter === "all"
                  ? "bg-red-50 border-red-500 text-red-500"
                  : "border-gray-300 hover:border-gray-400"
                }`}
            >
              Tất cả
            </button>

            <button
              onClick={() => setSelectedFilter("comment")}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm border transition ${selectedFilter === "comment"
                  ? "bg-red-50 border-red-500 text-red-500"
                  : "border-gray-300 hover:border-gray-400"
                }`}
            >
              💬 Bình luận ({totalComments})
            </button>

            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => setSelectedFilter(stars.toString())}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm border transition ${selectedFilter === stars.toString()
                    ? "bg-red-50 border-red-500 text-red-500"
                    : "border-gray-300 hover:border-gray-400"
                  }`}
              >
                {stars} ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Review Input */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          {/* Star Rating Selection */}
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <label className="text-sm font-medium">
                Đánh giá sản phẩm:
              </label>
              {checkingPurchase ? (
                <span className="text-xs text-gray-500">Đang kiểm tra...</span>
              ) : !hasPurchased ? (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  ⚠️ Cần mua hàng để đánh giá
                </span>
              ) : (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  ✓ Bạn đã mua sản phẩm này
                </span>
              )}
            </div>
            {renderInteractiveStars(selectedRating, setSelectedRating)}
            {selectedRating === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Không chọn sao = Bình luận (ai cũng có thể bình luận)
              </p>
            )}
          </div>

          <div className="relative">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={
                selectedRating > 0
                  ? "Chia sẻ đánh giá của bạn về sản phẩm..."
                  : "Nhập nội dung bình luận..."
              }
              className="w-full border border-gray-300 rounded-lg p-3 pr-16 sm:pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              rows={3}
              maxLength={3000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {reviewText.length}/3000
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-3 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
            <label className="cursor-pointer flex-shrink-0">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadedImages.length >= 5}
              />
              <div className={`w-14 h-14 sm:w-16 sm:h-16 border-2 border-dashed rounded-lg flex items-center justify-center transition ${uploadedImages.length >= 5
                  ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                  : "border-gray-300 hover:border-red-500 cursor-pointer"
                }`}>
                <span className={`text-xl sm:text-2xl ${uploadedImages.length >= 5 ? "text-gray-300" : "text-gray-400"}`}>
                  +
                </span>
              </div>
            </label>

            {uploadedImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-14 h-14 sm:w-16 sm:h-16 group flex-shrink-0"
              >
                <img src={image.url} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>

          {uploadedImages.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {uploadedImages.length}/5 ảnh đã chọn
            </p>
          )}

          <button
            onClick={handleSubmitReview}
            disabled={submitting || !reviewText.trim()}
            className="mt-3 bg-black text-white px-5 sm:px-6 py-2 rounded-lg hover:bg-gray-800 transition text-sm sm:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Đang gửi..." : selectedRating > 0 ? "Gửi đánh giá" : "Gửi bình luận"}
          </button>
        </div>

        {/* Reviews List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + "-" + selectedFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <p className="mt-2 text-gray-500">Đang tải đánh giá...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {!loading && !error && currentReviews.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {selectedFilter === "all"
                    ? "Chưa có đánh giá nào. Hãy là người đầu tiên!"
                    : `Chưa có ${selectedFilter === "comment" ? "bình luận" : `đánh giá ${selectedFilter} sao`} nào.`}
                </p>
              </div>
            )}

            {!loading &&
              currentReviews.map((review: any) => (
                <div key={review.id} className="border-b pb-4 sm:pb-6 last:border-b-0">
                  <div className="flex gap-2 sm:gap-3">
                    {/* User Avatar */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 text-sm sm:text-base overflow-hidden">
                      {review.user?.avatar ? (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${review.user.avatar}`} alt={review.userName} className="w-full h-full object-cover" />
                      ) : (
                        review.user?.fullName?.[0]?.toUpperCase() ?? "?"
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* User Info */}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <span className="font-semibold text-sm sm:text-base">
                          {review.user?.fullName}
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm">
                          • {review.timeAgo}
                        </span>
                        {review.rating === 0 && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            Bình luận
                          </span>
                        )}
                      </div>

                      {/* Rating Stars */}
                      {review.rating > 0 && (
                        <div className="flex mb-2 text-sm sm:text-base">
                          {renderStars(review.rating)}
                        </div>
                      )}

                      {/* Comment Text */}
                      <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base break-words mb-3">
                        {review.comment}
                      </p>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                          {review.images.map((img: any, idx: number) => (
                            <img
                              key={idx}
                              src={`${process.env.NEXT_PUBLIC_API_URL}${img.imageUrl}`}
                              alt={`Review image ${idx + 1}`}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                              onClick={() => {
                                // TODO: Add lightbox/modal for full image view
                                window.open(img.imageUrl, '_blank');
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition">
                          <span className="text-sm sm:text-base">👍</span>
                          <span className="text-xs sm:text-sm">{review.likes || 0}</span>
                        </button>
                        <button className="text-gray-500 hover:text-red-500 text-xs sm:text-sm transition">
                          ↩ Trả lời
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8 flex-wrap">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              ‹
            </button>

            {[...Array(totalPages)].map((_, i) => {
              // Show first page, last page, current page, and pages around current
              const pageNum = i + 1;
              const showPage =
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

              if (!showPage) {
                // Show ellipsis
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={i} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 sm:px-3 py-1 border rounded transition text-sm sm:text-base ${currentPage === pageNum
                      ? "bg-red-500 text-white border-red-500"
                      : "hover:bg-gray-50"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </>
  );
}