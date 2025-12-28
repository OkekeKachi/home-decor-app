"use client";

import Link from "next/link";
import { useAuth } from "../app/context/AuthContext";
import { useCart } from "../app/context/CartContext";
import { ShoppingBag, User, LogOut, Home, Package, Info, Mail } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
                {/* ✅ Logo */}
                <Link
                    href="/"
                    className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-rbg-clip-text text-transparent hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
                >
                    {/* <Home className="w-8 h-8 text-amber-600" /> */}
                    <div className="h-14 flex items-center">
                        <h1 className="text-2xl font-extrabold tracking-wide text-gray-900">
                            LuxHome
                            <span className="text-orange-500">.</span>
                        </h1>
                    </div>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link
                        href="/products"
                        className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors duration-200 font-medium group"
                    >
                        <Package className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span>Products</span>
                    </Link>
                    <Link
                        href="/about"
                        className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors duration-200 font-medium group"
                    >
                        <Info className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span>About</span>
                    </Link>
                    <Link
                        href="/contact"
                        className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors duration-200 font-medium group"
                    >
                        <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span>Contact</span>
                    </Link>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                    {user && (
                        <>
                            <Link href="/cart" className="relative group p-2 hover:bg-gray-50 rounded-full transition-colors duration-200">
                                <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-amber-600 transition-colors duration-200" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href="/order"
                                className="text-gray-700 hover:text-amber-600 transition-colors duration-200 font-medium hidden sm:block"
                            >
                                Orders
                            </Link>
                        </>
                    )}

                    {user ? (
                        <div className="flex items-center space-x-3">
                            <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-full">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-medium text-gray-700 text-sm">{user.username}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2 rounded-full transition-all duration-200 font-medium group"
                            >
                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                <span className="hidden sm:block">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden border-t border-gray-100 px-6 py-3 bg-gray-50/80">
                <div className="flex justify-center space-x-6">
                    <Link href="/products" className="text-gray-600 hover:text-amber-600 text-sm font-medium">
                        Products
                    </Link>
                    <Link href="/about" className="text-gray-600 hover:text-amber-600 text-sm font-medium">
                        About
                    </Link>
                    <Link href="/contact" className="text-gray-600 hover:text-amber-600 text-sm font-medium">
                        Contact
                    </Link>
                    {user && (
                        <Link href="/order" className="text-gray-600 hover:text-amber-600 text-sm font-medium">
                            Orders
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
