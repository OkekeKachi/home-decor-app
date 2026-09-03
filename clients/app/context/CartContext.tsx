"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";

import api from "@/utils/axios";
import { useAuth } from "./AuthContext";

interface CartProduct {
    _id: string;
    name?: string;
    price: number;
    image?: string;
}

interface CartItem {
    product: CartProduct;
    quantity: number;
}

interface CartResponse {
    _id?: string;
    user?: string;
    items: CartItem[];
    totalPrice?: number;
}

interface CartContextType {
    cart: CartItem[];
    loading: boolean;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    totalItems: number;
    totalPrice: number;
    setCart: Dispatch<SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            if (!user) {
                setCart([]);
                return;
            }

            try {
                setLoading(true);

                const token = Cookies.get("token");

                if (!token) {
                    setCart([]);
                    return;
                }

                const res = await api.get<CartResponse>("/api/cart", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCart(res.data.items ?? []);
            } catch (err: unknown) {
                console.error(
                    "Failed to load cart:",
                    axios.isAxiosError(err) ? err.response?.data : err
                );

                setCart([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [user]);

    const addToCart = async (
        productId: string,
        quantity: number = 1
    ): Promise<void> => {
        if (quantity < 1) {
            toast.error("Quantity must be at least 1");
            return;
        }

        try {
            const token = Cookies.get("token");

            if (!token) {
                toast.error("Please log in to add items to your cart");
                return;
            }

            const res = await api.post<CartResponse>(
                "/api/cart/add",
                { productId, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCart(res.data.items ?? []);

            toast.success(
                quantity > 1
                    ? `${quantity} items added to cart`
                    : "Product added to cart"
            );
        } catch (err: unknown) {
            console.error(
                "Failed to add to cart:",
                axios.isAxiosError(err) ? err.response?.data : err
            );

            toast.error(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || "Failed to add product to cart"
                    : "Failed to add product to cart"
            );
        }
    };

    const removeFromCart = async (productId: string): Promise<void> => {
        try {
            const token = Cookies.get("token");

            if (!token) {
                toast.error("Please log in to manage your cart");
                return;
            }

            const res = await api.delete<CartResponse>(
                `/api/cart/remove/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCart(res.data.items ?? []);

            toast.success("Product removed from cart");
        } catch (err: unknown) {
            console.error(
                "Failed to remove from cart:",
                axios.isAxiosError(err) ? err.response?.data : err
            );

            toast.error(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || "Failed to remove product"
                    : "Failed to remove product"
            );
        }
    };

    const updateQuantity = async (
        productId: string,
        quantity: number
    ): Promise<void> => {
        if (quantity < 1) {
            toast.error("Quantity must be at least 1");
            return;
        }

        try {
            const token = Cookies.get("token");

            if (!token) {
                toast.error("Please log in to manage your cart");
                return;
            }

            const res = await api.put<CartResponse>(
                "/api/cart/update",
                { productId, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCart(res.data.items ?? []);
        } catch (err: unknown) {
            console.error(
                "Failed to update cart:",
                axios.isAxiosError(err) ? err.response?.data : err
            );

            toast.error(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || "Failed to update cart"
                    : "Failed to update cart"
            );
        }
    };

    const clearCart = async (): Promise<void> => {
        try {
            const token = Cookies.get("token");

            if (!token) {
                toast.error("Please log in to manage your cart");
                return;
            }

            await api.delete("/api/cart/clear", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCart([]);
            toast.success("Cart cleared");
        } catch (err: unknown) {
            console.error(
                "Failed to clear cart:",
                axios.isAxiosError(err) ? err.response?.data : err
            );

            toast.error(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || "Failed to clear cart"
                    : "Failed to clear cart"
            );
        }
    };

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                setCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }

    return context;
};