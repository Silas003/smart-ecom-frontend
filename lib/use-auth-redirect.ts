// lib/use-auth-redirect.ts
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "./auth-store";

export function useAuthRedirect() {
    const router = useRouter();
    const pathname = usePathname();
    const token = useAuthStore((state) => state.token);
    const isHydrated = useAuthStore((state) => state.isHydrated);

    useEffect(() => {
        if (!isHydrated) return;
        if (!token) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [token, isHydrated, router, pathname]);
}