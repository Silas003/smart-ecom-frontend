// lib/use-require-auth.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./auth-store";

type Options = {
    redirectTo?: string;
    requiredRole?: string;
};

export function useRequireAuth({ redirectTo = "/login", requiredRole }: Options = {}) {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const isHydrated = useAuthStore((state) => state.isHydrated);

    useEffect(() => {
        // Critical: don't evaluate auth state until hydration is complete
        if (!isHydrated) return;

        if (!token) {
            router.replace(`${redirectTo}?reason=unauthenticated`);
            return;
        }

        if (requiredRole && user?.userRole?.toLowerCase() !== requiredRole.toLowerCase()) {
            router.replace("/unauthorized");
        }
    }, [isHydrated, token, user, router, redirectTo, requiredRole]);

    return { user, token, isHydrated, isAuthenticated: !!token };
}