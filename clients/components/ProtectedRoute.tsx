"use client";
import { useAuth } from "../app/context/AuthContext"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [loading, isAuthenticated, router]);

    if (loading) return <p>Loading...</p>;

    return isAuthenticated ? children : null;
}
