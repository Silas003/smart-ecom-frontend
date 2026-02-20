"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { useAuthStore } from "@/lib/auth-store";

// Routes that don't require authentication
const PUBLIC_ROUTES = new Set(["/login", "/register"]);
const isPublicRoute = (path: string) =>
    PUBLIC_ROUTES.has(path) || path.startsWith("/products"); // adjust as needed

export default function ClientShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const hydrate = useAuthStore((state) => state.hydrate);
    const token = useAuthStore((state) => state.token);
    const isHydrated = useAuthStore((state) => state.isHydrated);

    const isAdmin = pathname?.startsWith("/admin");
    const isAuth = PUBLIC_ROUTES.has(pathname);

    // 1. Hydrate once on mount
    useEffect(() => {
        hydrate();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 2. Reactively redirect when token disappears (logout or 401)
    useEffect(() => {
        if (!isHydrated) return;
        if (!token && !isPublicRoute(pathname)) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [token, isHydrated, pathname, router]);

    if (isAdmin || isAuth) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            <Footer />
        </>
    );
}