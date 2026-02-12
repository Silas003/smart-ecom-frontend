"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAuthStore } from "../../../lib/auth-store";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuthStore();

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="border-b border-zinc-200 bg-white/80 px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Admin
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Store management
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/products"
              className="hidden rounded-full border border-zinc-200 px-3 py-1 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 sm:inline-flex dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              View storefront
            </Link>
            {user && (
              <span className="hidden text-[11px] text-zinc-500 sm:inline dark:text-zinc-400">
                {user.username} ({user.userRole})
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
