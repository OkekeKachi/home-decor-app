
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
    title: "Home Decor App",
    description: "E-commerce platform",
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <CartProvider>
                        <Navbar />

                        {children}

                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                            }}
                        />

                        <Footer />
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}