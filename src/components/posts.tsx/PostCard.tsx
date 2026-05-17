"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Post Card Component
export default function PostCard({ post }: { post: any }) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleClick = () => {
    router.push(`/post/${post.slug}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
      className="group relative bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <motion.img
          src={post.thumbnail?.startsWith('http') 
              ? post.thumbnail 
              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${post.thumbnail}`
          }
          alt={post.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />

        {/* Category Badge */}
        {post.category && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {post.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors leading-snug">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {(post.author?.authorName || (post.author as any)?.fullName) && (
            <div className="flex items-center gap-1 text-red-600">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium">
                {post.author?.authorName || (post.author as any)?.fullName}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}