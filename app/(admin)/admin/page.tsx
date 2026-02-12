"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../../lib/auth-store";
import { getUsers } from "../../../lib/auth-api";
import { listProducts } from "../../../lib/api";
import { getAllOrders } from "../../../lib/orders";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<{
    users: number;
    products: number;
    orders: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/admin")}`);
      return;
    }
    if (user.userRole !== "admin") {
      router.push("/");
      return;
    }

    async function loadCounts() {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          getUsers({ page: 0, size: 100 }),
          listProducts({ page: 0, size: 1, sort: "price,asc" }),
          getAllOrders({ page: 0, size: 5 }),
        ]);
        setCounts({
          users: usersRes.data.totalElements,
          products: productsRes.data.totalElements,
          orders: ordersRes.data.totalElements,
        });
      } catch (err) {
        console.error("Failed to load admin summary", err);
        setError("Failed to load admin summary. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCounts();
  }, [isLoading, router, user]);

  if (isLoading || loading || !user || user.userRole !== "admin") {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin dashboard
        </h1>
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Overview
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Monitor store activity, manage catalog, and keep orders on track.
          </p>
        </div>
      </header>

      {counts && (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Users
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {counts.users.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Registered customers and admins.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Orders
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {counts.orders.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Total orders placed in the system.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Products
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {counts.products.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Active products in your catalog.
            </p>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Management
          </h2>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            Quickly access the main areas of your back office.
          </p>
          <div className="mt-3 grid gap-2 text-xs">
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2">

                <div className="flex flex-col">
                  <span>Users</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Manage accounts and roles.
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Manage
              </span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2">

                <div className="flex flex-col">
                  <span>Orders</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Review and update statuses.
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Review
              </span>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2">

                <div className="flex flex-col">
                  <span>Products</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Edit prices, stock, and details.
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Edit
              </span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2">

                <div className="flex flex-col">
                  <span>Categories</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Organize products by type.
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Organize
              </span>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Shortcuts
          </h2>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            Quick links to common storefront views.
          </p>
          <div className="mt-3 grid gap-2 text-xs">
            <Link
              href="/products"
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-center text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              View storefront
            </Link>
            <Link
              href="/"
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-center text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              Go to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
