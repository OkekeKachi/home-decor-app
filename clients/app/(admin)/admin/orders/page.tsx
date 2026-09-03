"use client";

import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import axios from "axios";

import api from "@/utils/axios";

type OrderStatus = "pending" | "completed" | "cancelled";

interface OrderUser {
    _id?: string;
    name?: string;
    username?: string;
    email?: string;
}

interface Order {
    _id: string;
    user?: OrderUser | null;
    totalPrice: number;
    status: OrderStatus;
    createdAt: string;
}

interface OrdersResponse {
    orders: Order[];
}

const statusOptions: OrderStatus[] = [
    "pending",
    "completed",
    "cancelled",
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = Cookies.get("token");

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await api.get<OrdersResponse>("/api/order", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOrders(response.data.orders);
        } catch (err: unknown) {
            let message = "Failed to load orders.";

            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (
        orderId: string,
        newStatus: OrderStatus
    ) => {
        try {
            setUpdating(orderId);

            const token = Cookies.get("token");

            if (!token) {
                toast.error("Authentication token not found.");
                return;
            }

            await api.put(
                `/api/order/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order._id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            toast.success("Order status updated successfully.");
        } catch (err: unknown) {
            let message = "Failed to update order status.";

            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            toast.error(message);
        } finally {
            setUpdating(null);
        }
    };

    const getStatusClasses = (status: OrderStatus) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-gray-500">Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">{error}</p>

                <button
                    type="button"
                    onClick={fetchOrders}
                    className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    All Orders
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage and update customer orders.
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <p className="text-gray-500">No orders found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Order ID
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    User
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Total
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Date
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr
                                    key={order._id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                        #{order._id.slice(-8)}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {order.user?.name ||
                                            order.user?.username ||
                                            order.user?.email ||
                                            "Guest"}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                        ₦
                                        {Number(
                                            order.totalPrice || 0
                                        ).toLocaleString()}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 py-3">
                                        <select
                                            value={order.status}
                                            disabled={updating === order._id}
                                            onChange={(event) =>
                                                handleStatusChange(
                                                    order._id,
                                                    event.target
                                                        .value as OrderStatus
                                                )
                                            }
                                            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {statusOptions.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}