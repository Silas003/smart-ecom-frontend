"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function OAuth2RedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((state) => state.login);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // Capture params immediately — don't keep searchParams in dep array
        const accessToken = searchParams.get("access");
        const refreshToken = searchParams.get("refresh");

        const processOAuthRedirect = async () => {
            if (!accessToken) {
                router.replace("/login?error=oauth_failed");
                return;
            }

            try {
                if (refreshToken) {
                    localStorage.setItem("refresh_token", refreshToken);
                }

                const response = await fetch(`${API_BASE}/api/v1/users/me`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!response.ok) throw new Error(`Profile fetch failed: ${response.status}`);

                const user = await response.json();
                login({ token: accessToken, user });

                // Normalize role comparison to avoid casing bugs
                const isAdmin = user.userRole?.toLowerCase() === "admin";
                router.replace(isAdmin ? "/admin" : "/");
            } catch (error) {
                console.error("OAuth redirect error:", error);
                router.replace("/login?error=oauth_error");
            }
        };

        processOAuthRedirect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-100" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Authorizing...
                </p>
            </div>
        </div>
    );
}