"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import api from "@/utils/axios";

interface User {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    createdAt: string;
}

interface UsersResponse {
    data: User[];
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = Cookies.get("token");

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await api.get<UsersResponse>(
                "/api/users/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUsers(response.data.data);
        } catch (err: unknown) {
            let message = "Failed to load users.";

            if (axios.isAxiosError(err)) {
                message =
                    err.response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-gray-500">Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">{error}</p>

                <button
                    type="button"
                    onClick={() => void fetchUsers()}
                    className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    All Users
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    View registered users and their account roles.
                </p>
            </div>

            {users.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <p className="text-gray-500">
                        No users found.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Name
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Email
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Role
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Joined
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr
                                    key={user._id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {user.name}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {user.email}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString()}
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