'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Filter, Loader2 } from 'lucide-react';
import { usePosts } from '@/hooks/usePost';
import { useCategories } from '@/hooks/useCategory';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';

// Hàm tính khoảng thời gian
function getTimeFilter(dateString: string) {
  const now = new Date().getTime();
  const postDate = new Date(dateString).getTime();

  const diffMs = now - postDate;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 24) return 'Hôm nay';
  if (diffDays <= 7) return 'Tuần trước';
  return 'Tháng trước';
}

// Hàm format thời gian hiển thị
function formatTimeAgo(dateString: string) {
  const now = Date.now();
  const postDate = new Date(dateString).getTime();

  const diffMs = now - postDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return `${diffWeeks} tuần trước`;
}

export default function BlogPostPage() {
  const { posts, loading, error, total, currentPage, limit, nextPage } = usePosts(10);
  const { categories } = useCategories();
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Map categoryId sang categoryName
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.categoryId === categoryId);
    return category?.categoryName || 'Chưa phân loại';
  };

  // Tính số lượng bài viết theo filter
  const timeFilters = useMemo(() => {
    const filterCounts = {
      'Hôm nay': 0,
      'Tuần trước': 0,
      'Tháng trước': 0
    };

    posts.forEach(post => {
      const filter = getTimeFilter(post.createdAt);
      if (filterCounts[filter] !== undefined) {
        filterCounts[filter]++;
      }
    });

    return [
      { name: 'Tất cả', count: total },
      { name: 'Hôm nay', count: filterCounts['Hôm nay'] },
      { name: 'Tuần trước', count: filterCounts['Tuần trước'] },
      { name: 'Tháng trước', count: filterCounts['Tháng trước'] }
    ];
  }, [posts, total]);

  // Lọc bài viết theo thời gian
  const filteredPosts = useMemo(() => {
    if (selectedFilter === 'Tất cả') return posts;
    return posts.filter(post => getTimeFilter(post.createdAt) === selectedFilter);
  }, [posts, selectedFilter]);

  // Xử lý load more
  const handleLoadMore = () => {
    nextPage(currentPage + 1);
  };

  return (
    <>
      <Header/>
      <div className="min-h-screen bg-[#F3F4F6]">
        {/* Header - Mobile Only */}
        <header className="bg-white border-b sticky top-0 z-10 lg:hidden">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Filter size={20} />
                Bộ lọc tìm kiếm
              </h1>

              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium"
              >
                Lọc
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
          <div className="flex gap-6">
            {/* Sidebar Filter */}
            <motion.aside
              className={`${isMobileFilterOpen ? 'fixed inset-0 z-20 bg-black bg-opacity-50' : 'hidden'
                } lg:block lg:relative lg:w-72 lg:flex-shrink-0`}
              initial={false}
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsMobileFilterOpen(false);
              }}
            >
              <div className={`${isMobileFilterOpen
                ? 'fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto'
                : 'bg-white rounded-xl shadow-sm sticky top-4'
                } p-6`}>
                {/* Mobile Close Button */}
                {isMobileFilterOpen && (
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="lg:hidden mb-4 text-gray-600 font-semibold text-lg"
                  >
                    ✕ Đóng
                  </button>
                )}

                {/* Desktop Title */}
                <div className="hidden lg:flex items-center gap-2 mb-6">
                  <Filter size={20} />
                  <h1 className="text-xl font-bold">Bộ lọc tìm kiếm</h1>
                </div>

                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-between w-full mb-4 text-left"
                >
                  <h2 className="font-semibold text-base">Thời gian đăng</h2>
                  {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isFilterOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3"
                  >
                    {timeFilters.map((filter) => (
                      <label
                        key={filter.name}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="timeFilter"
                            checked={selectedFilter === filter.name}
                            onChange={() => {
                              setSelectedFilter(filter.name);
                              setIsMobileFilterOpen(false);
                            }}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-sm group-hover:text-blue-600 transition-colors">
                            {filter.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">({filter.count})</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {loading && posts.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {filteredPosts.map((post, index) => (
                      <motion.article
                        key={post.postId}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
                      >
                        <div className="flex flex-col lg:flex-row gap-0">
                          {/* Image */}
                          <div className="w-full lg:w-96 h-56 lg:h-64 flex-shrink-0 overflow-hidden bg-gray-200">
                            {post.thumbnail ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${post.thumbnail}`}
                                alt={post.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span>Chưa có ảnh</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex flex-col justify-between p-5 lg:p-6">
                            <div>
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="text-xs font-medium text-white bg-blue-600 px-3 py-1 rounded-full">
                                  {getCategoryName(post.categoryId)}
                                </span>

                                {post.author?.authorName && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    {post.author.authorName}
                                  </span>
                                )}

                                <span className="text-xs text-gray-400 ml-auto">
                                  {formatTimeAgo(post.createdAt)}
                                </span>
                              </div>

                              <h2 className="text-lg lg:text-xl font-bold mb-3 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 leading-snug">
                                {post.title}
                              </h2>

                              {post.excerpt && (
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>

                            <div className="mt-4">
                              <a
                                href={`/post/${post.slug}`}
                                className="inline-flex items-center text-blue-600 text-sm font-semibold hover:text-blue-700 group"
                              >
                                Xem thêm
                                <svg
                                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {filteredPosts.length > 0 && posts.length < total && (
                    <motion.div
                      className="mt-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-8 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải...
                          </>
                        ) : (
                          `Xem thêm ${total - posts.length} kết quả`
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* Empty State */}
                  {!loading && filteredPosts.length === 0 && (
                    <motion.div
                      className="text-center py-16"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-gray-500">Không có bài viết nào trong khoảng thời gian này</p>
                    </motion.div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer/>
      <ScrollToTopButton/>
    </>
  );
}