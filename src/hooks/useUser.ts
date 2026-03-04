import { useState, useEffect, useCallback } from "react";
import { userService, User } from "../services/userService";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useUsers(initialLimit = 10) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // --- Fetch user với pagination + search ---
  const fetchUsers = useCallback(
    async ({ page = 1, limit = initialLimit, search = "" }: FetchParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getAll({ page, limit, search });
        setUsers(res.data);
        setTotal(res.total);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Lỗi tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    },
    [initialLimit]
  );

  // --- Search user ---
  const searchUsers = useCallback(
    async (keyword: string) => {
      setSearch(keyword);
      fetchUsers({ page: 1, limit: initialLimit, search: keyword });
    },
    [fetchUsers, initialLimit]
  );

  // --- Chuyển page ---
  const nextPage = useCallback(
    (page: number) => {
      fetchUsers({ page, limit: initialLimit, search });
    },
    [fetchUsers, initialLimit, search]
  );

  // --- Tạo user ---
  const createUser = useCallback(
    async (data: Partial<User>, avatarFile?: File) => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.create(data, avatarFile);
        setUsers(prev => [res, ...prev]);
        setTotal(prev => prev + 1);
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi tạo người dùng");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Cập nhật user ---
  const updateUser = useCallback(
    async (id: number, data: Partial<User>, avatarFile?: File) => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.update(id, data, avatarFile);
        setUsers(prev => prev.map(u => (u.userId === id ? res : u)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật người dùng");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Cập nhật trạng thái isActive ---
  const updateUserStatus = useCallback(
    async (id: number, isActive: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.updateStatus(id, isActive);
        setUsers(prev => prev.map(u => (u.userId === id ? res : u)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi cập nhật trạng thái");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Thay đổi role ---
  const changeUserRole = useCallback(
    async (id: number, role: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.changeRole(id, role);
        setUsers(prev => prev.map(u => (u.userId === id ? res : u)));
        return res;
      } catch (err: any) {
        setError(err.message || "Lỗi thay đổi quyền");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Xóa user ---
  const deleteUser = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        await userService.remove(id);
        setUsers(prev => prev.filter(u => u.userId !== id));
        setTotal(prev => prev - 1);
      } catch (err: any) {
        setError(err.message || "Lỗi xóa người dùng");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers({ page: 1, limit: initialLimit });
  }, [fetchUsers, initialLimit]);

  return {
    users,
    loading,
    error,
    currentPage,
    total,
    limit: initialLimit,
    search,
    fetchUsers,
    searchUsers,
    nextPage,
    createUser,
    updateUser,
    updateUserStatus,
    changeUserRole,
    deleteUser,
  };
}
