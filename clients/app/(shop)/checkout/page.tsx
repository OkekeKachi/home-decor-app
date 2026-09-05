"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Cookies from "js-cookie";
import {
    ArrowLeft,
    Package,
    Truck,
    CreditCard,
    Shield,    
    User,
    Mail,
    Phone,
    Loader2,
    CheckCircle,
    Lock,
    AlertCircle,
    Home
} from "lucide-react";
import { toast } from "react-hot-toast";


export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    

    // Form state
    const [shippingInfo, setShippingInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            router.push("/cart");
        }
    }, [cart, router]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required fields validation
        if (!shippingInfo.firstName.trim()) newErrors.firstName = "First name is required";
        if (!shippingInfo.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!shippingInfo.email.trim()) newErrors.email = "Email is required";
        if (!shippingInfo.phone.trim()) newErrors.phone = "Phone number is required";
        if (!shippingInfo.address.trim()) newErrors.address = "Address is required";
        if (!shippingInfo.city.trim()) newErrors.city = "City is required";
        if (!shippingInfo.state.trim()) newErrors.state = "State is required";
        if (!shippingInfo.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

        // Email validation
        if (shippingInfo.email && !/\S+@\S+\.\S+/.test(shippingInfo.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Terms agreement
        if (!agreeToTerms) {
            newErrors.terms = "You must agree to the terms and conditions";
            toast.error("You must agree to the terms and conditions");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const token = Cookies.get("token");

            const orderData = {
                paymentMethod,
                address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
                customerInfo: {
                    firstName: shippingInfo.firstName,
                    lastName: shippingInfo.lastName,
                    email: shippingInfo.email,
                    phone: shippingInfo.phone
                }
            };

            const res = await api.post("/api/order/checkout", orderData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // If Paystack, redirect to the authorization URL returned by the backend
            if (paymentMethod === "paystack" && res.data.authorization_url) {
                window.location.href = res.data.authorization_url;
            } else {
                // For cash_on_delivery or other methods, clear cart and redirect
                clearCart();
                router.push("/order");
            }
        } catch (err: any) {
            console.error("Order failed:", err.response?.data || err.message);
            setErrors({ general: err.response?.data?.message || "Failed to place order" });
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return null; // Will redirect via useEffect
    }

    const subtotal = totalPrice;
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            {/* Header */}
            <div className="bg-white border-b border-[#EEEAE2] sticky top-16 z-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push("/cart")}
                                className="flex items-center space-x-2 text-[#6B6B6B] hover:text-[#1C1C1C] transition-colors duration-200 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="font-medium">Back to Cart</span>
                            </button>
                            <div className="h-6 w-px bg-[#EEEAE2] hidden sm:block"></div>
                            <div className="flex items-center space-x-2">
                                <Shield className="w-6 h-6 text-[#D4B47A]" />
                                <h1 className="text-xl md:text-2xl font-serif text-[#1C1C1C]">Secure Checkout</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-[#6B6B6B]">
                            <Lock className="w-4 h-4" />
                            <span>SSL Secured</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Main Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Progress Steps */}
                        <div className="bg-white rounded-sm shadow-sm border border-[#EEEAE2] p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-[#225531] text-[#f3f3f3] rounded-sm flex items-center justify-center text-sm font-semibold">
                                        1
                                    </div>
                                    <span className="font-medium text-[#1C1C1C]">Shipping Information</span>
                                </div>
                            </div>

                            {errors.general && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-red-800">Order Error</h4>
                                        <p className="text-sm text-red-600">{errors.general}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        First Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]/50 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={shippingInfo.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B6B6B]/50 focus:outline-none focus:ring-1 transition-all duration-200 ${errors.firstName
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-[#EEEAE2] focus:border-[#D4B47A] focus:ring-[#D4B47A]'
                                                }`}
                                            placeholder="Emeka"
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Last Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]/50 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={shippingInfo.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B6B6B]/50 focus:outline-none focus:ring-1 transition-all duration-200 ${errors.lastName
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-[#EEEAE2] focus:border-[#D4B47A] focus:ring-[#D4B47A]'
                                                }`}
                                            placeholder="Opeyemi"
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]/50 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={shippingInfo.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B6B6B]/50 focus:outline-none focus:ring-1 transition-all duration-200 ${errors.email
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-[#EEEAE2] focus:border-[#D4B47A] focus:ring-[#D4B47A]'
                                                }`}
                                            placeholder="emeka@example.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]/50 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={shippingInfo.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B6B6B]/50 focus:outline-none focus:ring-1 transition-all duration-200 ${errors.phone
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-[#EEEAE2] focus:border-[#D4B47A] focus:ring-[#D4B47A]'
                                                }`}
                                            placeholder="+234 912 123 4567"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        Street Address *
                                    </label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-3 text-[#6B6B6B]/50 w-5 h-5" />
                                        <textarea
                                            value={shippingInfo.address}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B6B6B]/50 focus:outline-none focus:ring-1 transition-all duration-200 resize-none ${errors.address
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-[#EEEAE2] focus:border-[#D4B47A] focus:ring-[#D4B47A]'
                                                }`}
                                            placeholder="123 Main Street, Apt 4B"
                                            rows={3}
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingInfo.city}
                                        onChange={(e) => handleInputChange("city", e.target.value)}
                                        className={`w-full px-4 py-3 bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B6B6B]/50 focus:outline-none focus:ring-1 transition-all duration-200 ${errors.city
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-[#EEEAE2] focus:border-[#D4B47A] focus:ring-[#D4B47A]'
                                            }`}
                                        placeholder="Gwagwalada"
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingInfo.state}
                                        onChange={(e) => handleInputChange("state", e.target.value)}
                                        className={`w-full px-4 py-3 bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B6B6B]/50 focus:outline-none focus:ring-1 transition-all duration-200 ${errors.state
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-[#EEEAE2] focus:border-[#D4B47A] focus:ring-[#D4B47A]'
                                            }`}
                                        placeholder="Abuja"
                                    />
                                    {errors.state && (
                                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingInfo.zipCode}
                                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                                        className={`w-full px-4 py-3 bg-white border rounded-sm text-[#1C1C1C] placeholder-[#6B6B6B]/50 focus:outline-none focus:ring-1 transition-all duration-200 ${errors.zipCode
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-[#EEEAE2] focus:border-[#D4B47A] focus:ring-[#D4B47A]'
                                            }`}
                                        placeholder="10001"
                                    />
                                    {errors.zipCode && (
                                        <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-sm shadow-sm border border-[#EEEAE2] p-6 md:p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <CreditCard className="w-6 h-6 text-[#D4B47A]" />
                                <h3 className="text-lg font-serif text-[#1C1C1C]">Payment Method</h3>
                            </div>

                            <div className="space-y-3">
                                <label className={`flex items-center p-4 border rounded-sm cursor-pointer transition-all duration-200 ${paymentMethod === "cash_on_delivery"
                                        ? 'border-[#D4B47A] bg-[#D4B47A]/5'
                                        : 'border-[#EEEAE2] hover:border-[#D4B47A]/50'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={paymentMethod === "cash_on_delivery"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="text-[#D4B47A] focus:ring-[#D4B47A]"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-[#1C1C1C]">Cash on Delivery</span>
                                            <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-sm border border-green-100">
                                                Available
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#6B6B6B] mt-1">Pay when your order arrives</p>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border rounded-sm cursor-pointer transition-all duration-200 ${paymentMethod === "paystack"
                                        ? 'border-[#D4B47A] bg-[#D4B47A]/5'
                                        : 'border-[#EEEAE2] hover:border-[#D4B47A]/50'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paystack"
                                        checked={paymentMethod === "paystack"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="text-[#D4B47A] focus:ring-[#D4B47A]"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-[#1C1C1C]">Paystack</span>
                                            <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-sm border border-green-100">
                                                Available
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#6B6B6B] mt-1">Secure payment via Paystack</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="bg-white rounded-sm shadow-sm border border-[#EEEAE2] p-6 md:p-8">
                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => {
                                        setAgreeToTerms(e.target.checked);
                                        if (errors.terms) {
                                            setErrors(prev => ({ ...prev, terms: "" }));
                                        }
                                    }}
                                    className="w-5 h-5 mt-0.5 text-[#D4B47A] border-[#EEEAE2] rounded-sm focus:ring-[#D4B47A] cursor-pointer"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-[#6B6B6B] leading-relaxed">
                                        I agree to the{" "}
                                        <a href="/terms" className="text-[#D4B47A] hover:text-[#C9A66B] font-medium underline transition-colors duration-200">
                                            Terms of Service
                                        </a>{" "}
                                        and{" "}
                                        <a href="/privacy" className="text-[#D4B47A] hover:text-[#C9A66B] font-medium underline transition-colors duration-200">
                                            Privacy Policy
                                        </a>
                                    </p>
                                    {errors.terms && (
                                        <p className="mt-2 text-sm text-red-600">{errors.terms}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-sm shadow-sm border border-[#EEEAE2] p-6 md:p-8 sticky top-24">
                            <h3 className="text-lg font-serif text-[#1C1C1C] mb-6">Order Summary</h3>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item: any) => (
                                    <div key={item.product._id} className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-12 h-12 bg-[#FAF9F6] border border-[#EEEAE2] rounded-sm flex items-center justify-center overflow-hidden">
                                            {item.product.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package className="w-5 h-5 text-[#6B6B6B]/40" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[#1C1C1C] truncate text-sm">
                                                {item.product.name}
                                            </p>
                                            <p className="text-xs text-[#6B6B6B]">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-medium text-[#1C1C1C] text-sm">
                                            ₦{(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#6B6B6B]">Subtotal</span>
                                    <span className="font-medium text-[#1C1C1C]">₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#6B6B6B]">Shipping</span>
                                    <span className="font-medium text-[#183C32]">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#6B6B6B]">Tax (8%)</span>
                                    <span className="font-medium text-[#1C1C1C]">₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="border-t border-[#EEEAE2] pt-4 mt-4">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-base font-medium text-[#1C1C1C]">Total</span>
                                        <span className="text-2xl font-serif">
                                            ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-[#225531] hover:bg-[#093115] text-white py-4 px-6 rounded-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-6"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Placing Order...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Place Order</span>
                                    </>
                                )}
                            </button>

                            {/* Trust Signals */}
                            <div className="space-y-4 pt-6 border-t border-[#EEEAE2]">
                                <div className="flex items-center space-x-3 text-sm text-[#6B6B6B]">
                                    <Truck className="w-4 h-4 text-[#D4B47A] flex-shrink-0" />
                                    <span>Free shipping on all orders</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-[#6B6B6B]">
                                    <Shield className="w-4 h-4 text-[#D4B47A] flex-shrink-0" />
                                    <span>30-day money back guarantee</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-[#6B6B6B]">
                                    <Lock className="w-4 h-4 text-[#D4B47A] flex-shrink-0" />
                                    <span>Secure SSL encryption</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}