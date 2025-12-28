"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Cookies from "js-cookie";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = Cookies.get("token");

                const [statsRes, productsRes] = await Promise.all([
                    api.get("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
                    api.get("/api/admin/top-products", { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setStats(statsRes.data);
                setTopProducts(productsRes.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <p className="p-4">Loading dashboard...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;

    // Colors for charts
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A855F7"];

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold mb-6">📊 Admin Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow">
                    <p className="text-gray-500">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow">
                    <p className="text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow">
                    <p className="text-gray-500">Total Sales</p>
                    <p className="text-3xl font-bold text-green-600">
                        ₦{stats.totalSales.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders by Status */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.ordersByStatus.map((s: any) => ({ name: s._id, value: s.count }))}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {stats.ordersByStatus.map((_: any, index: number) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">Top Products</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProducts}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalQuantity" fill="#4F46E5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
