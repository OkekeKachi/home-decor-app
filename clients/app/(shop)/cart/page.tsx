"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Link from "next/link";
import Cookies from "js-cookie";
import {    
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

    const formatPrice = (price: number) => {
        return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#183C32]" />
                    <span className="text-[#1C1C1C]/60 text-sm tracking-widest uppercase">Loading your cart...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F3ED]">
            {/* Header */}
            <div className="bg-[#FAFAF8] border-b border-[#8B6F47]/10">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center space-x-2 text-[#1C1C1C]/60 hover:text-[#183C32] transition-colors duration-200 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="font-medium">Continue Shopping</span>
                            </button>
                            <div className="h-6 w-px bg-[#8B6F47]/20 hidden sm:block"></div>
                            <div className="flex items-center space-x-3">
                                <ShoppingBag className="w-6 h-6 text-[#8B6F47]" />
                                <div>
                                    <h1 className="text-2xl font-serif text-[#1C1C1C]">Your Cart</h1>
                                    {totalItems > 0 && (
                                        <p className="text-sm text-[#1C1C1C]/60">
                                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {cart.length > 0 && (
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="flex items-center space-x-2 text-[#1C1C1C]/60 hover:text-red-600 transition-colors duration-200 text-sm font-medium self-start sm:self-auto"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Clear Cart</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 md:py-12">
                {cart.length === 0 ? (
                    // Empty Cart State
                    <div className="max-w-md mx-auto text-center py-16">
                        <div className="w-20 h-20 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-[#8B6F47]" />
                        </div>
                        <h2 className="text-3xl font-serif text-[#1C1C1C] mb-3">Your cart is empty</h2>
                        <p className="text-[#1C1C1C]/60 mb-8 leading-relaxed">
                            Your next favorite piece is waiting. Explore our collection of carefully selected home decor.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center space-x-2 bg-[#183C32] hover:bg-[#183C32]/90 text-white px-8 py-3 rounded-sm font-medium tracking-wide transition-all duration-200"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>Explore Collection</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white border border-[#8B6F47]/10 rounded-sm overflow-hidden">
                                <div className="p-6 border-b border-[#8B6F47]/10 bg-[#FAFAF8]/50">
                                    <h2 className="text-lg font-serif text-[#1C1C1C]">Cart Items</h2>
                                </div>
                                <div className="divide-y divide-[#8B6F47]/10">
                                    {cart.map((item: any) => (
                                        <div key={item.product._id} className="p-6 hover:bg-[#FAFAF8]/30 transition-colors duration-200">
                                            <div className="flex flex-col sm:flex-row gap-5">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-sm flex items-center justify-center overflow-hidden">
                                                    {item.product.imageUrl ? (
                                                        <img
                                                            src={item.product.imageUrl}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-[#8B6F47]/40" />
                                                    )}
                                                </div>

                                                {/* Product Details & Actions */}
                                                <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-[#1C1C1C] text-lg mb-1">
                                                            {item.product.name}
                                                        </h3>
                                                        <p className="text-sm text-[#1C1C1C]/60 capitalize mb-3">
                                                            {item.product.category}
                                                        </p>
                                                        <p className="text-sm font-medium text-[#8B6F47]">
                                                            ₦{formatPrice(item.product.price)} <span className="text-[#1C1C1C]/40 font-normal">each</span>
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col sm:items-end gap-4 w-full sm:min-w-[140px]">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center border border-[#8B6F47]/20 rounded-sm bg-white w-fit">
                                                            <button
                                                                onClick={() => handleQuantityUpdate(item.product._id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1 || updatingItems.has(item.product._id)}
                                                                className="p-2.5 text-[#1C1C1C]/60 hover:text-[#183C32] hover:bg-[#F7F3ED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <div className="w-10 text-center text-[#1C1C1C] font-medium text-sm">
                                                                {updatingItems.has(item.product._id) ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                                                ) : (
                                                                    item.quantity
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleQuantityUpdate(item.product._id, item.quantity + 1)}
                                                                disabled={updatingItems.has(item.product._id)}
                                                                className="p-2.5 text-[#1C1C1C]/60 hover:text-[#183C32] hover:bg-[#F7F3ED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* Remove & Total */}
                                                        <div className="flex items-center justify-between w-full sm:justify-end gap-4">
                                                            <button
                                                                onClick={() => handleRemoveItem(item.product._id)}
                                                                disabled={updatingItems.has(item.product._id)}
                                                                className="p-2 text-[#1C1C1C]/40 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors duration-200 disabled:opacity-30"
                                                                title="Remove item"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                            <p className="font-medium text-[#1C1C1C] text-lg">
                                                                ₦{formatPrice(item.quantity * item.product.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white border border-[#8B6F47]/10 rounded-sm p-6 sticky top-24">
                                <h3 className="text-lg font-serif text-[#1C1C1C] mb-6">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#1C1C1C]/60">Subtotal ({totalItems} items)</span>
                                        <span className="font-medium text-[#1C1C1C]">₦{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#1C1C1C]/60">Shipping</span>
                                        <span className="font-medium text-[#183C32]">Free</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#1C1C1C]/60">Tax</span>
                                        <span className="font-medium text-[#1C1C1C]">₦{formatPrice(totalPrice * 0.08)}</span>
                                    </div>
                                    <div className="border-t border-[#8B6F47]/10 pt-4">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-base font-medium text-[#1C1C1C]">Total</span>
                                            <span className="text-2xl font-serif text-[#183C32]">
                                                ₦{formatPrice(totalPrice + (totalPrice * 0.08))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                    <Link
                                        href="/checkout"
                                        className="w-full bg-[#225531] hover:bg-[#093115] text-white py-3.5 px-6 rounded-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        <span>Proceed to Checkout</span>
                                    </Link>

                                <Link
                                    href="/products"
                                    className="w-full border border-[#8B6F47]/20 text-[#1C1C1C]/70 hover:bg-[#F7F3ED] hover:border-[#8B6F47]/40 py-3 px-6 rounded-sm font-medium tracking-wide transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>Continue Shopping</span>
                                </Link>
                            </div>

                            {/* Trust Signals */}
                            <div className="bg-[#FAFAF8] border border-[#8B6F47]/10 rounded-sm p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Truck className="w-5 h-5 text-[#8B6F47] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-[#1C1C1C]">Complimentary Shipping</p>
                                            <p className="text-xs text-[#1C1C1C]/50 mt-0.5">On all orders</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Shield className="w-5 h-5 text-[#8B6F47] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-[#1C1C1C]">30-Day Returns</p>
                                            <p className="text-xs text-[#1C1C1C]/50 mt-0.5">Hassle-free exchanges</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Heart className="w-5 h-5 text-[#8B6F47] mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-[#1C1C1C]">24/7 Support</p>
                                            <p className="text-xs text-[#1C1C1C]/50 mt-0.5">Dedicated customer care</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Clear Cart Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-[#1C1C1C]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-[#8B6F47]/10 rounded-sm max-w-md w-full p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-serif text-[#1C1C1C]">Clear Cart</h3>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="p-1 text-[#1C1C1C]/40 hover:text-[#1C1C1C] hover:bg-[#F7F3ED] rounded-sm transition-colors duration-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[#1C1C1C]/60 mb-8 leading-relaxed">
                            Are you sure you want to clear your cart? This action cannot be undone and all selected items will be removed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 border border-[#8B6F47]/20 text-[#1C1C1C]/70 hover:bg-[#F7F3ED] py-3 px-4 rounded-sm font-medium tracking-wide transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearCart}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-sm font-medium tracking-wide transition-colors duration-200"
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