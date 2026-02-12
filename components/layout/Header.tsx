"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCartStore } from "../../lib/cart-store";
import { useAuthStore } from "../../lib/auth-store";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/account/orders", label: "My orders" },
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Header() {
  const pathname = usePathname();
  const totalQuantity = useCartStore((state) => state.totalQuantity());
  const { user, isLoading, logout, hydrate } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const toggleMobile = () => setMobileOpen((prev) => !prev);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isAuthed = !!user;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:focus-visible:ring-zinc-300"
          >
            <span className="rounded-full bg-zinc-900 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-zinc-100 dark:text-zinc-900">
              Thrift-T
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-xs font-medium text-zinc-600 sm:flex dark:text-zinc-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "rounded-full px-2 py-1 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-300",
                isActive(item.href) &&
                  "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 p-2"
              )}
            >
              {item.label}
            </Link>
          ))}
          {user && user.userRole !== "admin" && (
            <Link
              href="/account"
              className="rounded-full px-2 py-1 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-300"
            >
              Account
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Search (desktop) */}
          <form
            action="/search"
            className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-500 shadow-sm sm:flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <label className="sr-only" htmlFor="header-search">
              Search products
            </label>
            <input
              id="header-search"
              type="text"
              name="q"
              placeholder="Search products"
              className="w-40 bg-transparent text-xs outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </form>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-300"
            aria-label="View cart"
          >
            <span className="text-lg">🛒</span>
            {totalQuantity > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {totalQuantity}
              </span>
            )}
          </Link>

          {/* Auth actions (desktop) */}
          {!isLoading && !isAuthed ? (
            <>
              <Link
                href="/login"
                className="hidden items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:inline-flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-300"
              >
                Sign in
              </Link>
            </>
          ) : null}

          {!isLoading && isAuthed && (
            <button
              type="button"
              onClick={logout}
              className="hidden items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:inline-flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-300"
            >
              Sign out
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="flex items-center justify-center rounded-full border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 sm:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-300"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={toggleMobile}
          >
            <span className="block h-0.5 w-4 rounded bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm sm:hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  "rounded-full px-3 py-1 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-300",
                  isActive(item.href) &&
                    "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/cart"
              className="mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-300"
              onClick={() => setMobileOpen(false)}
            >
              <span>Cart</span>
              {totalQuantity > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
