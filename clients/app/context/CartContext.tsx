"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/utils/axios";
import { useAuth } from "./AuthContext";

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
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(res.data);
                
                setCart(res.data.items || []);
            } catch (err) {
                console.error("Failed to load cart:", err.response?.data || err.message);
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
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            
            setCart(res.data.items);
        } catch (err) {
            console.error("Failed to add to cart:", err.response?.data || err.message);
        }
    };  

    // 🔹 Remove from cart
    const removeFromCart = async (productId) => {
        try {
            const token = Cookies.get("token");
            const res = await api.delete(`/api/cart/remove/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCart(res.data.items);
        } catch (err) {
            console.error("Failed to remove from cart:", err.response?.data || err.message);
        }
    };

    // 🔹 Update quantity
    const updateQuantity = async (productId, quantity) => {
        try {
            const token = Cookies.get("token");
            const res = await api.put(
                "/api/cart/update",
                { productId, quantity: quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(res.data.items);
        } catch (err) {
            console.error("Failed to update cart:", err.response?.data || err.message);
        }
    };

    // 🔹 Clear cart
    const clearCart = async () => {
        try {
            const token = Cookies.get("token");
            await api.delete("/api/cart/clear", {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ✅ reset cart immediately
            setCart([]);
        } catch (err) {
            console.error("Failed to clear cart:", err.response?.data || err.message);
        }
    };


    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
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
                setCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
