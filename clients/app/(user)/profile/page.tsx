"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Cookies from "js-cookie";
import {
    User,
    Mail,
    Lock,
    Package,
    Calendar,
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
    Star
} from "lucide-react";

export default function ProfilePage() {
    const { user, setUser, loading, logout } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        pendingOrders: 0
    });

    // Sync form state with user data
    useEffect(() => {
        if (user) {
            setForm({
                username: user?.username || user?.data?.username || "",
                email: user?.email || user?.data?.email || "",
                password: "",
            });
        }
    }, [user]);

    // Fetch user profile
    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            api.get("/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => setUser(res.data))
                .catch(() => setUser(null));
        }
    }, [setUser]);

    // Fetch user orders and calculate stats
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = Cookies.get("token");
                const res = await api.get("/api/order/my-orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const orderData = res.data.orders || [];
                setOrders(orderData);

                // Calculate stats
                const totalSpent = orderData.reduce((sum: number, order: any) => sum + order.totalPrice, 0);
                const completedOrders = orderData.filter((order: any) => order.status === 'completed' || order.status === 'delivered').length;
                const pendingOrders = orderData.filter((order: any) => order.status === 'pending' || order.status === 'processing').length;

                setStats({
                    totalOrders: orderData.length,
                    totalSpent,
                    completedOrders,
                    pendingOrders
                });
            } catch (err) {
                console.error("Failed to load orders:", err);
            } finally {
                setOrdersLoading(false);
            }
        };

        if (user) fetchOrders();
    }, [user]);

    // Handle profile update
    const handleUpdate = async (e: any) => {
        e.preventDefault();
        setUpdating(true);
        setMessage(null);

        try {
            const token = Cookies.get("token");
            const updateData = { ...form };

            // Don't send empty password
            if (!updateData.password) {
                delete updateData.password;
            }

            const res = await api.put("/api/users/profile", updateData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // If password changed, force re-login
            if (form.password) {
                setMessage({ type: 'success', text: 'Password updated! Please log in again.' });
                setTimeout(() => {
                    logout();
                    router.push('/login');
                }, 2000);
            } else {
                setUser(res.data);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Update failed'
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setForm({
            username: user?.username || user?.data?.username || "",
            email: user?.email || user?.data?.email || "",
            password: "",
        });
        setMessage(null);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-amber-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-lg font-medium">Loading profile...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Welcome, {user?.username || user?.data?.username}
                                </h1>
                                <p className="text-gray-600">Manage your account and view your orders</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                                <p className="text-sm text-gray-600">Total Orders</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">Total Spent</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <Settings className="w-6 h-6 text-amber-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors duration-200"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                )}
                            </div>

                            {message && (
                                <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${message.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                    {message.type === 'success' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4" />
                                    )}
                                    <span className="text-sm">{message.text}</span>
                                </div>
                            )}

                            {isEditing ? (
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={form.username}
                                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password (optional)
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={form.password}
                                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                                                placeholder="Leave blank to keep current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                                            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Username</p>
                                            <p className="font-medium text-gray-900">{user?.username || user?.data?.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email Address</p>
                                            <p className="font-medium text-gray-900">{user?.email || user?.data?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <ShoppingBag className="w-6 h-6 text-amber-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                                </div>
                                {orders.length > 0 && (
                                    <button
                                        onClick={() => router.push('/order')}
                                        className="text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors duration-200"
                                    >
                                        View All Orders
                                    </button>
                                )}
                            </div>

                            {ordersLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex items-center space-x-3 text-amber-600">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Loading orders...</span>
                                    </div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                                    <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
                                    <button
                                        onClick={() => router.push('/products')}
                                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map((order: any) => (
                                        <div key={order._id} className="border border-gray-100 rounded-xl p-4 hover:border-amber-200 transition-colors duration-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">${order.totalPrice}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-600">
                                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/order/${order._id}`)}
                                                    className="flex items-center space-x-1 text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors duration-200"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>View Details</span>
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