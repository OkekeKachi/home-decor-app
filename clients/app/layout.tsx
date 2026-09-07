import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
    title: {
        default: "LuxHome | Furniture, Lighting & Home Decor",
        template: "%s | LuxHome",
    },

    description:
        "Discover timeless furniture, lighting, textiles and home decor curated to bring comfort, character and elegance into every space.",

    metadataBase: new URL("https://home-decor-app.vercel.app"),

    alternates: {
        canonical: "/",
    },
    
    verification: {
        google: "qo9eJdxD9tTboJ372VSg2HhRgrtdKuSy1JoKIUMS9nI",
    },

    openGraph: {
        title: "LuxHome | Furniture, Lighting & Home Decor",
        description:
            "Discover timeless furniture, lighting, textiles and home decor curated to bring comfort, character and elegance into every space.",
        url: "https://home-decor-app.vercel.app",
        siteName: "LuxHome",
        type: "website",
        locale: "en_NG",
        images: [
            {
                url: "/og-image.svg",
                width: 1200,
                height: 1200,
                alt: "LuxHome — Furniture, Lighting & Home Decor",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "LuxHome | Furniture, Lighting & Home Decor",
        description:
            "Discover timeless furniture, lighting, textiles and home decor curated to bring comfort, character and elegance into every space.",
        images: ["/og-image.svg"],
    },

    icons: {
        icon: "/favicon.svg",
        shortcut: "/favicon.svg",
    },

    robots: {
        index: true,
        follow: true,
    },
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