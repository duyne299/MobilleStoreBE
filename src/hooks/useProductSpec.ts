import { useState, useEffect, useCallback } from "react";
import { productSpecService, ProductSpecification } from "../services/productSpecService";

export function useProductSpecs() {
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch all
  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productSpecService.getAll();
      setSpecs(data);
    } catch (err: any) {
      setError(err.message || "Lỗi tải specs");
    } finally {
      setLoading(false);
    }
  }, []);

  // create
  const createSpec = useCallback(async (data: Partial<ProductSpecification>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productSpecService.create(data);
      setSpecs(prev => [res, ...prev]);
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi tạo spec");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // update
  const updateSpec = useCallback(async (id: number, data: Partial<ProductSpecification>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productSpecService.update(id, data);
      setSpecs(prev => prev.map(s => (s.specId === id ? res : s)));
      return res;
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật spec");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // remove
  const removeSpec = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await productSpecService.remove(id);
      setSpecs(prev => prev.filter(s => s.specId !== id));
    } catch (err: any) {
      setError(err.message || "Lỗi xóa spec");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecs();
  }, [fetchSpecs]);

  return {
    specs,
    loading,
    error,
    fetchSpecs,
    createSpec,
    updateSpec,
    removeSpec,
  };
}
