"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Cookies from "js-cookie";
import axios from "axios";
import {
    User,
    Mail,
    Lock,
    Package,
    Settings,
    LogOut,
    Edit3,
    Save,
    X,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    CheckCircle,
    ShoppingBag,
    TrendingUp,
    Clock,
    ArrowRight,
} from "lucide-react";

type Message = {
    type: "success" | "error";
    text: string;
};

type ProfileForm = {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
};

type OrderStatus =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled";

type Order = {
    _id: string;
    totalPrice: number;
    status: OrderStatus;
    createdAt: string;
    items: unknown[];
};

type OrdersResponse = {
    orders: Order[];
};

const emptyForm: ProfileForm = {
    firstName: "",
    lastName: "",
    username: "",
    password: "",
};

export default function ProfilePage() {
    const { user, setUser, loading, logout } = useAuth();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);

    const [form, setForm] = useState<ProfileForm>(emptyForm);

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        pendingOrders: 0,
    });

    useEffect(() => {
        if (!user) return;

        setForm({
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            username: user.username ?? "",
            password: "",
        });
    }, [user]);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setOrders([]);
                setOrdersLoading(false);
                return;
            }

            try {
                const token = Cookies.get("token");

                if (!token) {
                    setOrders([]);
                    return;
                }

                const res = await api.get<OrdersResponse>("/api/order/my-orders", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const orderData = res.data.orders ?? [];

                setOrders(orderData);

                const totalSpent = orderData.reduce(
                    (sum, order) => sum + Number(order.totalPrice || 0),
                    0
                );

                const completedOrders = orderData.filter(
                    (order) =>
                        order.status === "completed" || order.status === "delivered"
                ).length;

                const pendingOrders = orderData.filter(
                    (order) =>
                        order.status === "pending" || order.status === "processing"
                ).length;

                setStats({
                    totalOrders: orderData.length,
                    totalSpent,
                    completedOrders,
                    pendingOrders,
                });
            } catch (err: unknown) {
                console.error(
                    "Failed to load orders:",
                    axios.isAxiosError(err) ? err.response?.data : err
                );

                setOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) return;

        setUpdating(true);
        setMessage(null);

        try {
            const token = Cookies.get("token");

            if (!token) {
                setMessage({
                    type: "error",
                    text: "Your session has expired. Please log in again.",
                });
                return;
            }

            const updateData: Partial<ProfileForm> = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                username: form.username.trim(),
            };

            if (form.password.trim()) {
                updateData.password = form.password;
            }

            const res = await api.put("/api/users/profile", updateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (form.password.trim()) {
                setMessage({
                    type: "success",
                    text: "Password updated! Please log in again.",
                });

                setTimeout(() => {
                    logout();
                    router.push("/login");
                }, 2000);

                return;
            }

            setUser(res.data);
            setIsEditing(false);
            setForm({
                firstName: res.data.firstName ?? "",
                lastName: res.data.lastName ?? "",
                username: res.data.username ?? "",
                password: "",
            });

            setMessage({
                type: "success",
                text: "Profile updated successfully!",
            });

            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } catch (err: unknown) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message
                : undefined;

            setMessage({
                type: "error",
                text: errorMessage || "Update failed. Please try again.",
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);

        setForm({
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            username: user?.username ?? "",
            password: "",
        });

        setMessage(null);
        setShowPassword(false);
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 text-yellow-800 border border-yellow-200";

            case "processing":
                return "bg-blue-50 text-blue-800 border border-blue-200";

            case "shipped":
                return "bg-purple-50 text-purple-800 border border-purple-200";

            case "delivered":
            case "completed":
                return "bg-green-50 text-green-800 border border-green-200";

            case "cancelled":
                return "bg-red-50 text-red-800 border border-red-200";

            default:
                return "bg-gray-50 text-gray-800 border border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#183C32]" />

                    <span className="text-[#1C1C1C]/60 text-sm tracking-widest uppercase">
                        Loading profile...
                    </span>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F7F3ED]">
            {/* Header */}
            <div className="bg-[#FAFAF8] border-b border-[#8B6F47]/10">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center space-x-5">
                            <div className="w-16 h-16 bg-[#F7F3ED] border border-[#8B6F47]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-7 h-7 text-[#8B6F47]" />
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-serif text-[#1C1C1C]">
                                    Welcome, {user.firstName || user.username}
                                </h1>

                                <p className="text-[#1C1C1C]/60 text-sm mt-1">
                                    Manage your account details and track your recent orders.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 text-[#1C1C1C]/60 hover:text-[#183C32] transition-colors duration-200 group self-start sm:self-auto"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />

                            <span className="font-medium text-sm tracking-wide">
                                Sign Out
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 md:py-12">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="bg-white border border-[#8B6F47]/10 rounded-sm p-5">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-[#183C32]" />
                            </div>

                            <div>
                                <p className="text-2xl font-serif text-[#1C1C1C]">
                                    {stats.totalOrders}
                                </p>

                                <p className="text-xs text-[#1C1C1C]/60 uppercase tracking-wider mt-1">
                                    Total Orders
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#8B6F47]/10 rounded-sm p-5">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-[#8B6F47]" />
                            </div>

                            <div>
                                <p className="text-2xl font-serif text-[#1C1C1C]">
                                    ₦{stats.totalSpent.toLocaleString()}
                                </p>

                                <p className="text-xs text-[#1C1C1C]/60 uppercase tracking-wider mt-1">
                                    Total Spent
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#8B6F47]/10 rounded-sm p-5">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-[#183C32]" />
                            </div>

                            <div>
                                <p className="text-2xl font-serif text-[#1C1C1C]">
                                    {stats.completedOrders}
                                </p>

                                <p className="text-xs text-[#1C1C1C]/60 uppercase tracking-wider mt-1">
                                    Completed
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#8B6F47]/10 rounded-sm p-5">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-[#8B6F47]" />
                            </div>

                            <div>
                                <p className="text-2xl font-serif text-[#1C1C1C]">
                                    {stats.pendingOrders}
                                </p>

                                <p className="text-xs text-[#1C1C1C]/60 uppercase tracking-wider mt-1">
                                    Pending
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-[#8B6F47]/10 rounded-sm overflow-hidden">
                            <div className="p-6 border-b border-[#8B6F47]/10 flex items-center justify-between bg-[#FAFAF8]/50">
                                <div className="flex items-center space-x-3">
                                    <Settings className="w-5 h-5 text-[#8B6F47]" />

                                    <h2 className="text-lg font-serif text-[#1C1C1C]">
                                        Profile Information
                                    </h2>
                                </div>

                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 text-[#8B6F47] hover:text-[#183C32] transition-colors duration-200 text-sm font-medium"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span>Edit</span>
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                {message && (
                                    <div
                                        className={`mb-6 p-4 rounded-sm flex items-start space-x-3 ${message.type === "success"
                                                ? "bg-green-50 text-green-800 border border-green-200"
                                                : "bg-red-50 text-red-800 border border-red-200"
                                            }`}
                                        role="alert"
                                    >
                                        {message.type === "success" ? (
                                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        )}

                                        <span className="text-sm leading-relaxed">
                                            {message.text}
                                        </span>
                                    </div>
                                )}

                                {isEditing ? (
                                    <form onSubmit={handleUpdate} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    htmlFor="firstName"
                                                    className="block text-xs font-semibold text-[#1C1C1C]/60 tracking-[0.1em] uppercase mb-2"
                                                >
                                                    First Name
                                                </label>

                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47]/50 w-4 h-4" />

                                                    <input
                                                        id="firstName"
                                                        type="text"
                                                        value={form.firstName}
                                                        onChange={(e) =>
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                firstName: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full pl-9 pr-4 py-3 bg-[#FAFAF8] border border-[#8B6F47]/20 rounded-sm text-sm text-[#1C1C1C] focus:outline-none focus:border-[#183C32] focus:ring-1 focus:ring-[#183C32] transition-all duration-200"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="lastName"
                                                    className="block text-xs font-semibold text-[#1C1C1C]/60 tracking-[0.1em] uppercase mb-2"
                                                >
                                                    Last Name
                                                </label>

                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47]/50 w-4 h-4" />

                                                    <input
                                                        id="lastName"
                                                        type="text"
                                                        value={form.lastName}
                                                        onChange={(e) =>
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                lastName: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full pl-9 pr-4 py-3 bg-[#FAFAF8] border border-[#8B6F47]/20 rounded-sm text-sm text-[#1C1C1C] focus:outline-none focus:border-[#183C32] focus:ring-1 focus:ring-[#183C32] transition-all duration-200"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        

                                        <div>
                                            <label
                                                htmlFor="password"
                                                className="block text-xs font-semibold text-[#1C1C1C]/60 tracking-[0.1em] uppercase mb-2"
                                            >
                                                New Password{" "}
                                                <span className="normal-case tracking-normal font-normal text-[#1C1C1C]/40">
                                                    (optional)
                                                </span>
                                            </label>

                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47]/50 w-4 h-4" />

                                                <input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={form.password}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            password: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full pl-9 pr-12 py-3 bg-[#FAFAF8] border border-[#8B6F47]/20 rounded-sm text-sm text-[#1C1C1C] focus:outline-none focus:border-[#183C32] focus:ring-1 focus:ring-[#183C32] transition-all duration-200 placeholder:text-[#8B6F47]/40"
                                                    placeholder="Leave blank to keep current"
                                                    autoComplete="new-password"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    aria-label={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47]/50 hover:text-[#1C1C1C] transition-colors duration-200"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="flex-1 bg-[#183C32] hover:bg-[#183C32]/90 text-white py-3 px-4 rounded-sm text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            >
                                                {updating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Updating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        <span>Save Changes</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="flex-1 border border-[#8B6F47]/20 text-[#1C1C1C]/70 hover:bg-[#F7F3ED] py-3 px-4 rounded-sm text-sm font-medium tracking-wide transition-colors duration-200 flex items-center justify-center space-x-2"
                                            >
                                                <X className="w-4 h-4" />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-4 p-4 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-sm">
                                            <User className="w-5 h-5 text-[#8B6F47] mt-0.5 flex-shrink-0" />

                                            <div>
                                                <p className="text-xs text-[#1C1C1C]/60 uppercase tracking-wider mb-1">
                                                    Username
                                                </p>

                                                <p className="font-medium text-[#1C1C1C]">
                                                    {user.username}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4 p-4 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-sm">
                                            <Mail className="w-5 h-5 text-[#8B6F47] mt-0.5 flex-shrink-0" />

                                            <div>
                                                <p className="text-xs text-[#1C1C1C]/60 uppercase tracking-wider mb-1">
                                                    Email Address
                                                </p>

                                                <p className="font-medium text-[#1C1C1C]">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-[#8B6F47]/10 rounded-sm overflow-hidden">
                            <div className="p-6 border-b border-[#8B6F47]/10 flex items-center justify-between bg-[#FAFAF8]/50">
                                <div className="flex items-center space-x-3">
                                    <ShoppingBag className="w-5 h-5 text-[#8B6F47]" />

                                    <h2 className="text-lg font-serif text-[#1C1C1C]">
                                        Recent Orders
                                    </h2>
                                </div>

                                {orders.length > 0 && (
                                    <button
                                        onClick={() => router.push("/order")}
                                        className="text-[#183C32] hover:text-[#183C32]/80 font-medium text-sm transition-colors duration-200 flex items-center space-x-1 group"
                                    >
                                        <span>View All Orders</span>

                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                    </button>
                                )}
                            </div>

                            {ordersLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="flex flex-col items-center space-y-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#183C32]" />

                                        <span className="text-[#1C1C1C]/60 text-sm tracking-wider uppercase">
                                            Loading orders...
                                        </span>
                                    </div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-16 px-6">
                                    <div className="w-16 h-16 bg-[#F7F3ED] border border-[#8B6F47]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Package className="w-8 h-8 text-[#8B6F47]" />
                                    </div>

                                    <h3 className="text-xl font-serif text-[#1C1C1C] mb-3">
                                        No orders yet
                                    </h3>

                                    <p className="text-[#1C1C1C]/60 mb-8 max-w-sm mx-auto leading-relaxed">
                                        Start shopping to see your curated pieces and track your
                                        deliveries here.
                                    </p>

                                    <button
                                        onClick={() => router.push("/products")}
                                        className="inline-flex items-center space-x-2 bg-[#183C32] hover:bg-[#183C32]/90 text-white px-8 py-3 rounded-sm font-medium tracking-wide transition-all duration-200"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Start Shopping</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#8B6F47]/10">
                                    {orders.slice(0, 5).map((order) => (
                                        <div
                                            key={order._id}
                                            className="p-6 hover:bg-[#FAFAF8]/50 transition-colors duration-200"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                    <span className="font-medium text-[#1C1C1C]">
                                                        Order #{order._id.slice(-8).toUpperCase()}
                                                    </span>

                                                    <span
                                                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-sm border text-xs font-medium tracking-wide w-fit ${getStatusColor(
                                                            order.status
                                                        )}`}
                                                    >
                                                        <span className="capitalize">
                                                            {order.status}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="text-left sm:text-right">
                                                    <p className="text-lg font-serif text-[#183C32]">
                                                        ₦{Number(order.totalPrice).toLocaleString()}
                                                    </p>

                                                    <p className="text-xs text-[#1C1C1C]/50 mt-0.5">
                                                        {new Date(order.createdAt).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-[#8B6F47]/10">
                                                <div className="text-sm text-[#1C1C1C]/60">
                                                    {order.items.length} item
                                                    {order.items.length !== 1 ? "s" : ""}
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        router.push(`/order/${order._id}`)
                                                    }
                                                    className="flex items-center space-x-1.5 text-[#183C32] hover:text-[#183C32]/80 text-sm font-medium transition-colors duration-200 group"
                                                >
                                                    <span>View Details</span>

                                                    <Eye className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}