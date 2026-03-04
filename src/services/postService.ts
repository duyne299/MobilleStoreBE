import axiosClient from "@/lib/axiosClient";

export interface Post {
  postId: number;
  title: string;
  slug: string;
  thumbnail?: string | null;
  content: string;
  excerpt?: string | null;
  isActive: boolean;
  createdAt: string;
  author: {
    authorName: string | null;
  };
  categoryId: number;
}

export interface PostListResponse {
  data: Post[];
  total: number;
}

export const postService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PostListResponse> {
    const res = await axiosClient.get<PostListResponse>("/posts", {
      params: params || {},
    });
    return res.data;
  },

  // Lấy chi tiết bài viết theo slug
  async getBySlug(slug: string): Promise<Post> {
    const res = await axiosClient.get<Post>(`/posts/${slug}`);
    return res.data;
  },

  // Tạo bài viết mới (upload thumbnail)
  async create(
    data: Omit<Post, "postId" | "author" | "createdAt" | "updatedAt">,
    file?: File
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
      formData.append("thumbnail", file);
    }

    const res = await axiosClient.post<Post>("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Cập nhật bài viết theo slug
  async update(
    slug: string,
    data: Partial<Omit<Post, "postId" | "author" | "createdAt" | "updatedAt">>,
    file?: File
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
      formData.append("thumbnail", file);
    }

    const res = await axiosClient.put<Post>(`/posts/${slug}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  // Xóa bài viết
  async remove(id: number): Promise<void> {
    await axiosClient.delete(`/posts/${id}`);
  },

  // Đổi trạng thái isActive
  async changeStatus(id: number, isActive: boolean): Promise<Post> {
    const res = await axiosClient.patch<Post>(`/posts/${id}/status`, {
      isActive,
    });
    return res.data;
  },
};
