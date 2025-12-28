import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
    title: "Home Decor App",
    description: "E-commerce platform",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <CartProvider>
                        <Navbar />
                        {children}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}


