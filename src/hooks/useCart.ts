    import { useState, useEffect, useCallback } from "react";
    import { cartService, Cart, AddToCartDto, CartItem } from "../services/cartService";

    export function useCart() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Lấy giỏ hàng ---
    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
        const res = await cartService.getCart();
        setCart(res);
        setItems(res.items || []);
        setTotal(res.total || 0);
        } catch (err: any) {
        // Nếu giỏ hàng trống hoặc chưa có, không coi là lỗi
        if (err.response?.status === 404) {
            setCart(null);
            setItems([]);
            setTotal(0);
        } else {
            setError(err.message || "Lỗi tải giỏ hàng");
        }
        } finally {
        setLoading(false);
        }
    }, []);

    // --- Thêm sản phẩm vào giỏ ---
    const addToCart = useCallback(
        async (data: AddToCartDto) => {
        setLoading(true);
        setError(null);
        try {
            const res = await cartService.addToCart(data);
            // Refresh lại giỏ hàng sau khi thêm
            await fetchCart();
            return res;
        } catch (err: any) {
            setError(err.message || "Lỗi thêm vào giỏ hàng");
            throw err;
        } finally {
            setLoading(false);
        }
        },
        [fetchCart]
    );

    // --- Cập nhật số lượng ---
    const updateQuantity = useCallback(
        async (itemId: number, quantity: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await cartService.updateQuantity(itemId, quantity);
            // Cập nhật local state
            setItems((prev) =>
            prev.map((item) =>
                item.itemId === itemId ? { ...item, quantity } : item
            )
            );
            setTotal(res.total);
            return res;
        } catch (err: any) {
            setError(err.message || "Lỗi cập nhật số lượng");
            throw err;
        } finally {
            setLoading(false);
        }
        },
        []
    );

    // --- Cập nhật trạng thái check của 1 item ---
    const updateItemCheck = useCallback(
        async (itemId: number, isChecked: boolean) => {
        setError(null);
        try {
            const res = await cartService.updateItemCheck(itemId, isChecked);
            // Cập nhật local state
            setItems((prev) =>
            prev.map((item) =>
                item.itemId === itemId ? { ...item, isChecked } : item
            )
            );
            return res;
        } catch (err: any) {
            setError(err.message || "Lỗi cập nhật trạng thái");
            throw err;
        }
        },
        []
    );

    // --- Cập nhật trạng thái check của tất cả items ---
    const updateAllItemsCheck = useCallback(
        async (isChecked: boolean) => {
        setError(null);
        try {
            const res = await cartService.updateAllItemsCheck(isChecked);
            // Cập nhật local state
            setItems((prev) =>
            prev.map((item) => ({ ...item, isChecked }))
            );
            return res;
        } catch (err: any) {
            setError(err.message || "Lỗi cập nhật trạng thái");
            throw err;
        }
        },
        []
    );

    // --- Xóa sản phẩm ---
    const removeItem = useCallback(async (itemId: number) => {
        setLoading(true);
        setError(null);
        try {
        const res = await cartService.removeItem(itemId);
        // Cập nhật local state
        setItems((prev) => prev.filter((item) => item.itemId !== itemId));
        setTotal(res.total);
        return res;
        } catch (err: any) {
        setError(err.message || "Lỗi xóa sản phẩm");
        throw err;
        } finally {
        setLoading(false);
        }
    }, []);

    // --- Xóa toàn bộ giỏ ---
    const clearCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
        const res = await cartService.clearCart();
        setCart(null);
        setItems([]);
        setTotal(0);
        return res;
        } catch (err: any) {
        setError(err.message || "Lỗi xóa giỏ hàng");
        throw err;
        } finally {
        setLoading(false);
        }
    }, []);

    // --- Tính tổng số lượng sản phẩm trong giỏ ---
    const getTotalItems = useCallback(() => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    }, [items]);

    // Load giỏ hàng khi component mount
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return {
        cart,
        items,
        total,
        loading,
        error,
        itemCount: getTotalItems(),
        fetchCart,
        addToCart,
        updateQuantity,
        updateItemCheck,    
        updateAllItemsCheck, 
        removeItem,
        clearCart,
    };
    }