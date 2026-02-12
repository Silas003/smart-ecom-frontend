"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "../../../lib/user";
import { getUserOrders, type Order } from "../../../lib/orders";
import { useToast } from "../../../components/ui/toaster";

export default function AccountOrdersPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent("/account/orders")}`);
      return;
    }
    getUserOrders(userId)
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Failed to load orders", err);
        const message = err instanceof Error ? err.message : "Failed to load orders";
        setError(message);
        addToast(message, "error");
      })
      .finally(() => setLoading(false));
  }, [router, addToast]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your orders
        </h1>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Your orders
      </h1>
      {orders.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You haven&apos;t placed any orders yet.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  Order #{order.id}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {order.items?.length || 0} items
                  · ${order.totalAmount?.toFixed(2) ?? "0.00"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                  {order.status}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

