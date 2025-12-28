"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminRoute from "@/components/adminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BarChart3, Users, ShoppingCart, Package } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: <BarChart3 size={18} /> },
        { name: "Users", href: "/admin/users", icon: <Users size={18} /> },
        { name: "Orders", href: "/admin/orders", icon: <ShoppingCart size={18} /> },
        { name: "Products", href: "/admin/products", icon: <Package size={18} /> },
        { name: "Top Products", href: "/admin/top-products", icon: <BarChart3 size={18} /> },
    ];

    return (
        <ProtectedRoute>
            <AdminRoute>
                <div className="flex min-h-screen bg-gray-100">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white shadow-md">
                        <div className="p-4 text-xl font-bold border-b">Admin Panel</div>
                        <nav className="p-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 transition
                                    ${pathname === item.href ? "bg-gray-200 font-semibold" : ""}`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 p-6">{children}</main>
                    <Toaster position="top-right" reverseOrder={false} />
                </div>
            </AdminRoute>
        </ProtectedRoute>
    );
}
