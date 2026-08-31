"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    const isAdmin = user?.data?.role === "admin";

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace("/");
        }
    }, [loading, isAdmin, router]);

    // While checking authentication
    if (loading) {
        return <p>Loading...</p>;
    }

    // Don't render admin content for non-admins
    if (!user || !isAdmin) {
        return null;
    }

    return <>{children}</>;
}