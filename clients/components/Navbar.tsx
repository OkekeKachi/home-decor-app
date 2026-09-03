"use client";

import Link from "next/link";
import { useAuth } from "../app/context/AuthContext";
import { useCart } from "../app/context/CartContext";
import {
    ShoppingCart,
    User,
    LogOut,
    Package,
    Info,
    Mail,
} from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();

    return (
        <nav className="sticky top-0 z-50 h-[88px] bg-[#F7F3ED] border-b border-[#8B6F47]/20">
            <div className="container mx-auto flex items-center justify-between px-8 py-3">
                {/* Logo */}
                <Link href="/" className="flex items-center group">
                    <h1 className="text-[28px] font-serif font-semibold tracking-wide text-[#1C1C1C] group-hover:text-[#183C32] transition-colors duration-300">
                        LuxHome<span className="text-[#C9A66B]">.</span>
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-10">
                    <Link
                        href="/products"
                        className="flex items-center space-x-2 text-[#1C1C1C] hover:text-[#183C32] transition-colors duration-200 text-sm font-medium tracking-wide group"
                    >
                        <Package className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
                        <span>Products</span>
                    </Link>

                    <Link
                        href="/about"
                        className="flex items-center space-x-2 text-[#1C1C1C] hover:text-[#183C32] transition-colors duration-200 text-sm font-medium tracking-wide group"
                    >
                        <Info className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
                        <span>About</span>
                    </Link>

                    <Link
                        href="/contact"
                        className="flex items-center space-x-2 text-[#1C1C1C] hover:text-[#183C32] transition-colors duration-200 text-sm font-medium tracking-wide group"
                    >
                        <Mail className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
                        <span>Contact</span>
                    </Link>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-5">
                    {user && (
                        <>
                            <Link
                                href="/cart"
                                aria-label={`Cart with ${totalItems} items`}
                                className="relative group p-2 hover:bg-[#183C32]/5 rounded transition-colors duration-200"
                            >
                                <ShoppingCart className="w-5 h-5 text-[#1C1C1C] group-hover:text-[#183C32] transition-colors duration-200" />

                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#183C32] text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                                        {totalItems > 99 ? "99+" : totalItems}
                                    </span>
                                )}
                            </Link>

                            <Link
                                href="/order"
                                className="text-[#1C1C1C] hover:text-[#183C32] transition-colors duration-200 text-sm font-medium tracking-wide hidden sm:block"
                            >
                                Orders
                            </Link>
                        </>
                    )}

                    {user ? (
                        <div className="flex items-center space-x-3">
                            <Link href="/profile">
                                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 hover:bg-[#183C32]/5 rounded transition-colors duration-200">
                                    <div className="w-7 h-7 bg-[#8B6F47]/10 border border-[#8B6F47]/20 rounded-full flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-[#8B6F47]" />
                                    </div>

                                    <span className="font-medium text-[#1C1C1C] text-sm">
                                        {user.username}
                                    </span>
                                </div>
                            </Link>

                            <button
                                type="button"
                                onClick={logout}
                                className="flex items-center space-x-2 text-[#1C1C1C] hover:text-[#183C32] px-3 py-1.5 hover:bg-[#183C32]/5 rounded transition-all duration-200 text-sm font-medium group"
                            >
                                <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
                                <span className="hidden sm:block">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-[#183C32] hover:bg-[#183C32]/90 text-white px-5 py-2 rounded text-sm font-medium tracking-wide transition-colors duration-200"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-[#8B6F47]/20 px-8 py-4 bg-[#F7F3ED]">
                <div className="flex justify-center space-x-6">
                    <Link
                        href="/products"
                        className="text-[#1C1C1C] hover:text-[#183C32] text-sm font-medium tracking-wide transition-colors duration-200"
                    >
                        Products
                    </Link>

                    <Link
                        href="/about"
                        className="text-[#1C1C1C] hover:text-[#183C32] text-sm font-medium tracking-wide transition-colors duration-200"
                    >
                        About
                    </Link>

                    <Link
                        href="/contact"
                        className="text-[#1C1C1C] hover:text-[#183C32] text-sm font-medium tracking-wide transition-colors duration-200"
                    >
                        Contact
                    </Link>

                    {user && (
                        <Link
                            href="/order"
                            className="text-[#1C1C1C] hover:text-[#183C32] text-sm font-medium tracking-wide transition-colors duration-200"
                        >
                            Orders
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}