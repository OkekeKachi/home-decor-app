"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace("/");
        }
    }, [loading, user, isAdmin, router]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!user || !isAdmin) {
        return null;
    }

    return <>{children}</>;
}