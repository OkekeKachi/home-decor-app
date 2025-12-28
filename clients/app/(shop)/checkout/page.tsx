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
    MapPin,
    User,
    Mail,
    Phone,
    Loader2,
    CheckCircle,
    Lock,
    AlertCircle,
    Home
} from "lucide-react";

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

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

            clearCart();
            router.push("/order");
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push("/cart")}
                                className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors duration-200"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Back to Cart</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                            <div className="flex items-center space-x-2">
                                <Shield className="w-6 h-6 text-amber-600" />
                                <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Lock className="w-4 h-4" />
                            <span>SSL Secured</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Progress Steps */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            1
                                        </div>
                                        <span className="font-medium text-gray-900">Shipping Information</span>
                                    </div>
                                </div>
                            </div>

                            {errors.general && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-red-800">Order Error</h4>
                                        <p className="text-sm text-red-600">{errors.general}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={shippingInfo.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${errors.firstName
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                                                }`}
                                            placeholder="John"
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={shippingInfo.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${errors.lastName
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                                                }`}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={shippingInfo.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${errors.email
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                                                }`}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={shippingInfo.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${errors.phone
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                                                }`}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address *
                                    </label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                        <textarea
                                            value={shippingInfo.address}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${errors.address
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingInfo.city}
                                        onChange={(e) => handleInputChange("city", e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${errors.city
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                                            }`}
                                        placeholder="New York"
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingInfo.state}
                                        onChange={(e) => handleInputChange("state", e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${errors.state
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                                            }`}
                                        placeholder="NY"
                                    />
                                    {errors.state && (
                                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingInfo.zipCode}
                                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${errors.zipCode
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <CreditCard className="w-6 h-6 text-amber-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors duration-200">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={paymentMethod === "cash_on_delivery"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">Cash on Delivery</span>
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                Available
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Pay when your order arrives</p>
                                    </div>
                                </label>

                                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-not-allowed opacity-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="stripe"
                                        disabled
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">Credit/Debit Card</span>
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                                Coming Soon
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Stripe integration coming soon</p>
                                    </div>
                                </label>

                                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-not-allowed opacity-50">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paystack"
                                        disabled
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">Paystack</span>
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                                Coming Soon
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Nigerian payment gateway</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
                                    className="w-5 h-5 mt-0.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700">
                                        I agree to the{" "}
                                        <a href="/terms" className="text-amber-600 hover:text-amber-700 font-medium underline">
                                            Terms of Service
                                        </a>{" "}
                                        and{" "}
                                        <a href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium underline">
                                            Privacy Policy
                                        </a>
                                    </p>
                                    {errors.terms && (
                                        <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6">
                                {cart.map((item: any) => (
                                    <div key={item.product._id} className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                            {item.product.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate text-sm">
                                                {item.product.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-900 text-sm">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax (8%)</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-base font-semibold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-amber-600">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 mb-4"
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
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <Truck className="w-4 h-4 text-amber-500" />
                                    <span>Free shipping on all orders</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <Shield className="w-4 h-4 text-amber-500" />
                                    <span>30-day money back guarantee</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                    <Lock className="w-4 h-4 text-amber-500" />
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