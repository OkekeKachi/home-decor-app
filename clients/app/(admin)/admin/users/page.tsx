"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Cookies from "js-cookie";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = Cookies.get("token");
                const res = await api.get("/api/users/all", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                setUsers(res.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <p>Loading users...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">All Users</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left border-b">Name</th>
                            <th className="px-4 py-2 text-left border-b">Email</th>
                            <th className="px-4 py-2 text-left border-b">Role</th>
                            <th className="px-4 py-2 text-left border-b">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b">{u.name}</td>
                                <td className="px-4 py-2 border-b">{u.email}</td>
                                <td className="px-4 py-2 border-b">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${u.role === "admin"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-2 border-b">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

