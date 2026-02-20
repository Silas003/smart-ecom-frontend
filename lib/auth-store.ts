// lib/auth-store.ts
"use client";

import { create } from "zustand";
import type { User } from "./auth-api";

type AuthState = {
    user: User | null;
    token: string | null;
    isHydrated: boolean;

    login: (payload: { token: string; user: User }) => void;
    logout: () => void;
    hydrate: () => void;
    setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isHydrated: false,

    hydrate: () => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("auth_token");
        const raw = localStorage.getItem("auth_user");

        if (token && raw) {
            try {
                const user = JSON.parse(raw) as User;
                set({ token, user, isHydrated: true });
                return;
            } catch {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
            }
        }

        set({ token: null, user: null, isHydrated: true });
    },

    login: ({ token, user }) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));

        set({ token, user, isHydrated: true });
    },

    logout: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("refresh_token");
        set({ token: null, user: null, isHydrated: true });
    },

    setUser: (user) => {
        localStorage.setItem("auth_user", JSON.stringify(user));
        set({ user });
    },
}));

// Safe non-reactive accessor — not a hook
export const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
};

export const getCurrentUserId = (): number | null => {
    return useAuthStore.getState().user?.id ?? null;
};

export const getAuthHeader = (): Record<string, string> => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};