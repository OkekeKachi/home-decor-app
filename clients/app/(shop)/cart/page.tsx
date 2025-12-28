"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Link from "next/link";
import Cookies from "js-cookie";
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    ArrowLeft,
    Package,
    Loader2,
    ShoppingBag,
    CreditCard,
    Truck,
    Shield,
    Heart,
    X
} from "lucide-react";

export default function CartPage() {
    const {
        cart,
        setCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
    } = useCart();

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = Cookies.get("token");
                const res = await api.get("/api/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setCart(res.data.items || []);
            } catch (err: any) {
                console.error("CART FETCH ERROR:", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [setCart]);

    const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setUpdatingItems(prev => new Set([...prev, productId]));
        try {
            await updateQuantity(productId, newQuantity);
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const handleRemoveItem = async (productId: string) => {
        setUpdatingItems(prev => new Set([...prev, productId]));
        try {
            await removeFromCart(productId);
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const handleClearCart = async () => {
        await clearCart();
        setShowClearConfirm(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-amber-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-lg font-medium">Loading your cart...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors duration-200"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Continue Shopping</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="w-6 h-6 text-amber-600" />
                                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                                {totalItems > 0 && (
                                    <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2 py-1 rounded-full">
                                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        {cart.length > 0 && (
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Clear Cart</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {cart.length === 0 ? (
                    // Empty Cart State
                    <div className="max-w-md mx-auto text-center">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-10 h-10 text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
                            <p className="text-gray-600 mb-8">
                                Looks like you haven't added any items to your cart yet.
                                Discover our amazing home decor collection!
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span>Start Shopping</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {cart.map((item: any) => (
                                        <div key={item.product._id} className="p-6">
                                            <div className="flex items-center space-x-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {item.product.imageUrl ? (
                                                        <img
                                                            src={item.product.imageUrl}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 capitalize mt-1">
                                                        {item.product.category}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="font-semibold text-amber-600">
                                                            ${item.product.price}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            each
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                                        <button
                                                            onClick={() => handleQuantityUpdate(item.product._id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || updatingItems.has(item.product._id)}
                                                            className="p-2 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <div className="px-4 py-2 min-w-[3rem] text-center">
                                                            {updatingItems.has(item.product._id) ? (
                                                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                                            ) : (
                                                                <span className="font-medium">{item.quantity}</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleQuantityUpdate(item.product._id, item.quantity + 1)}
                                                            disabled={updatingItems.has(item.product._id)}
                                                            className="p-2 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveItem(item.product._id)}
                                                        disabled={updatingItems.has(item.product._id)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Item Total */}
                                                <div className="text-right min-w-[4rem]">
                                                    <p className="font-bold text-gray-900">
                                                        ${(item.quantity * item.product.price).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                        <span className="font-medium">${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium">${(totalPrice * 0.08).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between">
                                            <span className="text-base font-semibold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-amber-600">
                                                ${(totalPrice + (totalPrice * 0.08)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 mb-4"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    <span>Proceed to Checkout</span>
                                </Link>

                                <Link
                                    href="/products"
                                    className="w-full border border-gray-300 hover:border-amber-300 text-gray-700 hover:text-amber-600 py-3 px-6 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    <span>Continue Shopping</span>
                                </Link>
                            </div>

                            {/* Trust Signals */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Why shop with us?</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Truck className="w-5 h-5 text-amber-500" />
                                        <span className="text-gray-600">Free shipping on all orders</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Shield className="w-5 h-5 text-amber-500" />
                                        <span className="text-gray-600">30-day money back guarantee</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Heart className="w-5 h-5 text-amber-500" />
                                        <span className="text-gray-600">24/7 customer support</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Clear Cart Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Clear Cart</h3>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to clear your cart? This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearCart}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}