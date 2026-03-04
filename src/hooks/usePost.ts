import { useState, useEffect, useCallback } from "react";
import { postService, Post } from "@/services/postService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function usePosts(initialLimit = 10) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // fetch bài viết với pagination + search
  const fetchPosts = useCallback(
    async ({ page = 1, limit = initialLimit, search = "" }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await postService.getAll({ page, limit, search });
        setPosts(res.data);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải bài viết");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  // search bài viết
  const searchPosts = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      fetchPosts({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchPosts, initialLimit]
  );

  // chuyển trang
  const nextPage = useCallback(
    (page: number) => {
      fetchPosts({ page, limit: initialLimit, search });
    },
    [fetchPosts, initialLimit, search]
  );

  // get chi tiết bài viết theo slug
  const getPostBySlug = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postService.getBySlug(slug);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tải bài viết");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // tạo bài viết mới
  const createPost = useCallback(
    async (data: Omit<Post, "postId" | "author" | "createdAt" | "updatedAt">, file?: File) => {
      setLoading(true);
      setError(null);
      try {
        const res = await postService.create(data, file);
        setPosts((prev) => [res, ...prev]);
        setTotal((prev) => prev + 1);
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi tạo bài viết");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // cập nhật bài viết
  const updatePost = useCallback(
    async (
      slug: string,
      data: Partial<Omit<Post, "postId" | "author" | "createdAt" | "updatedAt">>,
      file?: File
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await postService.update(slug, data, file);
        setPosts((prev) => prev.map((p) => (p.slug === slug ? res : p)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật bài viết");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // xóa bài viết
  const deletePost = useCallback(async (postId: number) => {
    setLoading(true);
    setError(null);
    try {
      await postService.remove(postId);
      setPosts((prev) => prev.filter((p) => p.postId !== postId));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      setError(err.message || "Lỗi xóa bài viết");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // đổi trạng thái isActive
  const updatePostStatus = useCallback(async (postId: number, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postService.changeStatus(postId, isActive);
      setPosts((prev) => prev.map((p) => (p.postId === postId ? { ...p, isActive: res.isActive } : p)));
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi thay đổi trạng thái bài viết");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts({ page: 1, limit: initialLimit });
  }, [fetchPosts, initialLimit]);

  return {
    posts,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchPosts,
    searchPosts,
    nextPage,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    updatePostStatus,
  };
}
