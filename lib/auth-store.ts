"use client";

import { create } from "zustand";
import type { User, LoginResponse } from "./auth-api";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginResponse) => void;
  logout: () => void;
  hydrate: () => void;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  login: ({ token, user }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    set({ user, token, isLoading: false });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    set({ user: null, token: null, isLoading: false });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        set({ token: storedToken, user, isLoading: false });
      } catch {
        set({ token: null, user: null, isLoading: false });
      }
    } else {
      set({ token: null, user: null, isLoading: false });
    }
  },
  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    set((state) => ({ ...state, user }));
  },
}));

export function getAuthHeader() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  const token = localStorage.getItem("auth_token");
  if (!token) return {} as Record<string, string>;
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}
