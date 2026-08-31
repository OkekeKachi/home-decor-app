"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/utils/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 Load cart from backend when user logs in
    useEffect(() => {
        const fetchCart = async () => {
            if (!user) {
                setCart([]);
                return;
            }

            try {
                setLoading(true);

                const token = Cookies.get("token");

                const res = await api.get("/api/cart", {
                    headers: {
                        Authorization: `Bearer ${ token } `,
                    },
                });

                console.log(res.data);

                setCart(res.data.items || []);
            } catch (err) {
                console.error(
                    "Failed to load cart:",
                    err.response?.data || err.message
                );

                setCart([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [user]);

    // 🔹 Add to cart
    const addToCart = async (productId, quantity = 1) => {
        try {
            const token = Cookies.get("token");

            const res = await api.post(
                "/api/cart/add",
                { productId, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${ token } `,
                    },
                }
            );

            setCart(res.data.items);

            toast.success(
                quantity > 1
                    ? `${ quantity } items added to cart`
                    : "Product added to cart"
            );
        } catch (err) {
            console.error(
                "Failed to add to cart:",
                err.response?.data || err.message
            );

            toast.error(
                    "Failed to add product to cart"
            );
        }
    };

    // 🔹 Remove from cart
    const removeFromCart = async (productId) => {
        try {
            const token = Cookies.get("token");

            const res = await api.delete(
                `/api/cart/remove/${productId} `,
                {
                    headers: {
                        Authorization: `Bearer ${ token } `,
                    },
                }
            );

            setCart(res.data.items);

            toast.success("Product removed from cart");
        } catch (err) {
            console.error(
                "Failed to remove from cart:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                    "Failed to remove product"
            );
        }
    };

    // 🔹 Update quantity
    const updateQuantity = async (productId, quantity) => {
        try {
            const token = Cookies.get("token");

            const res = await api.put(
                "/api/cart/update",
                {
                    productId,
                    quantity,
                },
                {
                    headers: {
                        Authorization: `Bearer ${ token } `,
                    },
                }
            );

            setCart(res.data.items);
        } catch (err) {
            console.error(
                "Failed to update cart:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                    "Failed to update cart"
            );
        }
    };

    // 🔹 Clear cart
    const clearCart = async () => {
        try {
            const token = Cookies.get("token");

            await api.delete("/api/cart/clear", {
                headers: {
                    Authorization: `Bearer ${ token } `,
                },
            });

            // ✅ Reset cart immediately
            setCart([]);

            toast.success("Cart cleared");
        } catch (err) {
            console.error(
                "Failed to clear cart:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                    "Failed to clear cart"
            );
        }
    };

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (sum, item) =>
            sum + item.product.price * item.quantity,
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

export const useCart = () => useContext(CartContext);
