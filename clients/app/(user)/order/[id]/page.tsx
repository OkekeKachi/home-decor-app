"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios";
import Cookies from "js-cookie";
import {
    ArrowLeft,
    Package,
    Calendar,
    CreditCard,
    MapPin,
    CheckCircle,
    Clock,
    Truck,
    AlertCircle,
    Loader2,
    ShoppingBag
} from "lucide-react";

export default function OrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = Cookies.get("token");
                const res = await api.get(`/api/order/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrder(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load order");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <Clock className="w-5 h-5" />;
            case 'processing':
                return <Package className="w-5 h-5" />;
            case 'shipped':
                return <Truck className="w-5 h-5" />;
            case 'delivered':
                return <CheckCircle className="w-5 h-5" />;
            case 'cancelled':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Package className="w-5 h-5" />;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-amber-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-lg font-medium">Loading order details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                            <p className="text-gray-600">Order #{id}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                                <div className="text-sm text-gray-500">
                                    {order.createdAt && new Date(order.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`flex items-center space-x-3 p-4 rounded-xl border ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <div>
                                        <p className="font-medium">Order Status</p>
                                        <p className="text-sm capitalize">{order.status}</p>
                                    </div>
                                </div>

                                <div className={`flex items-center space-x-3 p-4 rounded-xl border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                    <CreditCard className="w-5 h-5" />
                                    <div>
                                        <p className="font-medium">Payment Status</p>
                                        <p className="text-sm capitalize">{order.paymentStatus}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <ShoppingBag className="w-6 h-6 text-amber-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
                                <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2 py-1 rounded-full">
                                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {order.items?.map((item: any, index: number) => (
                                    <div key={item._id || index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl hover:border-amber-200 transition-colors duration-200">
                                        {/* Product Image Placeholder */}
                                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                            {item.product?.image ? (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <Package className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {item.product?.name || 'Product Name'}
                                            </h3>
                                            <p className="text-sm text-gray-500 capitalize">
                                                {item.product?.category || 'Category'}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="text-sm text-gray-600">
                                                    Qty: {item.quantity}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    ₦{item.product?.price?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                ₦{(item.quantity * (item.product?.price || 0)).toLocaleString()}
                                            </p>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₦{(order.totalPrice * 0.9).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">₦{(order.totalPrice * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">₦0.00</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-base font-semibold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-amber-600">
                                            ₦{order.totalPrice?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <MapPin className="w-5 h-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <p><span className="font-medium text-gray-900">Address:</span></p>
                                <p className="pl-4">
                                    {order.shippingAddress || "123 Main Street\nAnytown, ST 12345\nUnited States"}
                                </p>

                                <div className="pt-3 mt-3 border-t border-gray-100">
                                    <p><span className="font-medium text-gray-900">Expected Delivery:</span></p>
                                    <p className="pl-4 text-amber-600 font-medium">
                                        {order.estimatedDelivery || "3-5 business days"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200">
                                Track Order
                            </button>
                            <button className="w-full border border-gray-300 hover:border-amber-300 text-gray-700 hover:text-amber-600 py-3 px-4 rounded-xl font-medium transition-colors duration-200">
                                Download Invoice
                            </button>
                            {order.status === 'delivered' && (
                                <button className="w-full border border-gray-300 hover:border-amber-300 text-gray-700 hover:text-amber-600 py-3 px-4 rounded-xl font-medium transition-colors duration-200">
                                    Leave Review
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}