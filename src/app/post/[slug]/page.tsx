'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Type, Clock, Share2, Bookmark, Facebook, Link as LinkIcon, Loader2 } from 'lucide-react';
import { usePosts } from '@/hooks/usePost';
import { useCategories } from '@/hooks/useCategory';
import { Post } from '@/services/postService';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { getPostBySlug, loading, error } = usePosts();
  const { categories } = useCategories();

  const [post, setPost] = useState<Post | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  const formatTimeAgo = (dateString: string) => {
    const now = Date.now();
    const postDate = new Date(dateString).getTime();
    const diffMs = now - postDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return `${Math.floor(diffDays / 7)} tuần trước`;
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.categoryId === categoryId);
    return category?.categoryName || 'Chưa phân loại';
  };

  useEffect(() => {
    if (slug) {
      getPostBySlug(slug).then(data => {
        setPost(data);
      }).catch(err => {
        console.error('Error loading post:', err);
      });
    }
  }, [slug, getPostBySlug]);

  const fontSizeClasses = {
    normal: 'text-base leading-relaxed',
    large: 'text-lg leading-loose'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy bài viết'}</p>
          <a href="/posts" className="text-blue-600 hover:underline">
            ← Quay lại danh sách bài viết
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F3F4F6]">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-2 text-sm overflow-x-auto">
                <a href="/" className="text-blue-600 hover:underline whitespace-nowrap">
                  Trang chủ
                </a>
                <span className="text-gray-400">/</span>
                <a href="/posts" className="text-blue-600 hover:underline whitespace-nowrap">
                  Bài viết
                </a>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600 truncate max-w-[200px] sm:max-w-md">
                  {post.title}
                </span>
              </nav>

              <div className="flex items-center gap-3 ml-4">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-3 py-1.5 rounded-md transition-all ${fontSize === 'normal'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                    title="Cỡ chữ bình thường"
                  >
                    <Type size={18} />
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-3 py-1.5 rounded-md transition-all ${fontSize === 'large'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                    title="Cỡ chữ lớn"
                  >
                    <Type size={22} />
                  </button>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bookmark size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
          <div className="flex gap-6 lg:gap-8">
            {/* Main Content - Gộp Hero và Article trong 1 div */}
            <motion.main
              className="flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <article className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Hero Section - Ảnh full width */}
                <div className="relative">
                  {/* Featured Image - Full width */}
                  <div className="w-full bg-gray-200">
                    {post.thumbnail ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${post.thumbnail}`}
                        alt={post.title}
                        className="w-full h-auto object-cover aspect-[16/9] lg:aspect-[21/9]"
                      />
                    ) : (
                      <div className="w-full h-[400px] flex items-center justify-center text-gray-400">
                        <span>Chưa có ảnh</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content - Giữa màn hình */}
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                  {/* Post Info */}
                  <div className="py-8">
                    {/* Author & Time */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {post.author?.authorName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {post.author?.authorName || 'Tác giả'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                      {post.title}
                    </h1>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b">
                      <span className="text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-full">
                        {getCategoryName(post.categoryId)}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex items-center gap-3 pb-8 border-b">
                      <span className="text-sm text-gray-600">Chia sẻ:</span>
                      <button className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors">
                        <Facebook size={18} fill="currentColor" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9.5 2C6.5 2 4 4.5 4 7.5S6.5 13 9.5 13 15 10.5 15 7.5 12.5 2 9.5 2zm0 9C7.6 11 6 9.4 6 7.5S7.6 4 9.5 4 13 5.6 13 7.5 11.4 11 9.5 11z" />
                        </svg>
                      </button>
                      <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors">
                        <LinkIcon size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="pb-12">
                    <div
                      className={`prose prose-gray max-w-none ${fontSizeClasses[fontSize]} transition-all duration-300`}
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>
                </div>
              </article>
            </motion.main>

            {/* Related Posts Sidebar */}
            <motion.aside
              className="hidden lg:block w-80 flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="sticky top-20">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                    Bài viết liên quan
                    <span className="text-sm font-normal text-gray-500">
                      ({relatedPosts.length})
                    </span>
                  </h2>

                  {relatedPosts.length > 0 ? (
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost, index) => (
                        <motion.a
                          key={relatedPost.postId}
                          href={`/post/${relatedPost.slug}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        >
                          <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                            {relatedPost.thumbnail ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${relatedPost.thumbnail}`}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                              {relatedPost.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{formatTimeAgo(relatedPost.createdAt)}</span>
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Chưa có bài viết liên quan
                    </p>
                  )}

                  <button className="w-full mt-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors">
                    Xem thêm bài viết →
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>

        {/* Mobile Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="lg:hidden bg-white border-t mt-6 px-4 py-6">
            <h2 className="text-lg font-bold mb-4">Bài viết liên quan</h2>
            <div className="space-y-4">
              {relatedPosts.slice(0, 3).map((relatedPost) => (
                <a
                  key={relatedPost.postId}
                  href={`/post/${relatedPost.slug}`}
                  className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                    {relatedPost.thumbnail ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${relatedPost.thumbnail}`}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{formatTimeAgo(relatedPost.createdAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-blue-600 font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Xem tất cả bài viết liên quan
            </button>
          </div>
        )}
      </div>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}