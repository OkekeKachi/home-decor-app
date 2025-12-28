"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const statusOptions = ["pending", "processing", "completed", "cancelled"];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const res = await api.get("/api/order", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data.orders);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to load orders";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            setUpdating(orderId);
            const token = Cookies.get("token");
            await api.put(
                `/api/order/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // update UI
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId ? { ...o, status: newStatus } : o
                )
            );
            toast.success(`Order ${orderId} updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">All Orders</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border-b">Order ID</th>
                            <th className="px-4 py-2 border-b">User</th>
                            <th className="px-4 py-2 border-b">Total</th>
                            <th className="px-4 py-2 border-b">Status</th>
                            <th className="px-4 py-2 border-b">Date</th>
                            <th className="px-4 py-2 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o._id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b">{o._id}</td>
                                <td className="px-4 py-2 border-b">
                                    {o.user?.name || "Guest"}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    ₦{o.totalPrice.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${o.status === "completed"
                                                ? "bg-green-100 text-green-700"
                                                : o.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {new Date(o.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <select
                                        value={o.status}
                                        disabled={updating === o._id}
                                        onChange={(e) =>
                                            handleStatusChange(
                                                o._id,
                                                e.target.value
                                            )
                                        }
                                        className="border rounded px-2 py-1 text-sm"
                                    >
                                        {statusOptions.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
