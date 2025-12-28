// components/AdminRoute.tsx
"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.data.role !== "admin")) {
            router.push("/"); // redirect non-admins to home
        }
    }, [loading, user, router]);

    if (loading) return <p>Loading...</p>;

    return <>{children}</>;
}