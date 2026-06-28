import axiosClient from "@/lib/axiosClient";

export interface Post {
  postId: number;
  title: string;
  slug: string;
  thumbnail?: string | null;
  content: string;
  excerpt?: string | null;
  isActive?: boolean;
  active?: boolean;
  status?: string;
  createdAt: string;
  author?: {
    authorName?: string | null;
    fullName?: string | null;
  } | null;
  categoryId: number;
}

export interface PostListResponse {
  data: Post[];
  total: number;
}

const normalizePost = (post: Post): Post => {
  const statusValue = typeof post.status === "string" ? post.status.toLowerCase() : undefined;
  const isActiveFromStatus =
    statusValue === "active" || statusValue === "true" || statusValue === "1"
      ? true
      : statusValue === "inactive" || statusValue === "false" || statusValue === "0"
      ? false
      : undefined;

  return {
    ...post,
    isActive: post.isActive ?? post.active ?? isActiveFromStatus ?? true,
  };
};

export const postService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PostListResponse> {
    const res = await axiosClient.get<PostListResponse>("/api/posts", {
      params: params || {},
    });
    return {
      data: res.data.data.map(normalizePost),
      total: res.data.total,
    };
  },

  // Lấy chi tiết bài viết theo slug
  async getBySlug(slug: string): Promise<Post> {
    const res = await axiosClient.get<Post>(`/api/posts/${slug}`);
    return normalizePost(res.data);
  },

  // Tạo bài viết mới (upload thumbnail)
  async create(
    data: Omit<Post, "postId" | "author" | "createdAt" | "updatedAt">,
    file?: File,
  ): Promise<Post> {
    const formData = new FormData();
    for (const key in data) {
      const value = (data as any)[key];
      if (key === "isActive") {
        formData.append(key, value ? "true" : "false");
        continue;
      }
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
    if (file) {
      formData.append("image", file);
    }

    const res = await axiosClient.post<Post>("/api/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizePost(res.data);
  },

  // Cập nhật bài viết theo slug
  async update(
    slug: string,
    data: Partial<Omit<Post, "postId" | "author" | "createdAt" | "updatedAt">>,
    file?: File,
  ): Promise<Post> {
    const formData = new FormData();

    for (const key in data) {
      const value = (data as any)[key];
      if (key === "isActive") {
        formData.append(key, value ? "true" : "false");
        continue;
      }
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    if (file) {
      formData.append("image", file);
    }

    const res = await axiosClient.put<Post>(`/api/posts/${slug}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return normalizePost(res.data);
  },

  // Xóa bài viết
  async remove(id: number): Promise<void> {
    await axiosClient.delete(`/api/posts/${id}`);
  },

  // Đổi trạng thái isActive
  async changeStatus(id: number, isActive: boolean): Promise<Post> {
    const res = await axiosClient.patch<Post>(`/api/posts/${id}/status`, {
      isActive,
    });
    return normalizePost(res.data);
  },
};
