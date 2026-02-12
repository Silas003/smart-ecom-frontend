"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllOrders, updateOrderStatus, type Order } from "../../../../lib/orders";
import { useAuthStore } from "../../../../lib/auth-store";
import { useToast } from "../../../../components/ui/toaster";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isLoading, hydrate } = useAuthStore();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadPage = async (pageIndex: number) => {
    const res = await getAllOrders({ page: pageIndex, size: pageSize });
    setOrders(res.data.content);
    setTotalPages(res.data.totalPages);
    setPage(res.data.number);
  };

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/admin/orders")}`);
      return;
    }
    if (user.userRole !== "admin") {
      router.push("/");
      return;
    }

    loadPage(0)
      .catch((err) => {
        console.error("Failed to load orders", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      })
      .finally(() => setInitialLoading(false));
  }, [isLoading, router, user, hydrate]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await updateOrderStatus(id, { status });
      const updated = res.data;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      addToast("Order status updated", "success");
    } catch (err) {
      console.error("Failed to update order status", err);
      const message = "Failed to update order status.";
      setError(message);
      addToast(message, "error");
    }
  };

  const handlePageChange = (nextPage: number) => {
    loadPage(nextPage).catch(() => {});
  };

  if (isLoading || (!user && initialLoading)) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Orders
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Orders
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Manage orders
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Review customer orders and update their statuses as they progress.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>Orders</span>
          {initialLoading && <span>Loading...</span>}
        </div>
        {orders.length === 0 && !initialLoading ? (
          <div className="px-3 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No orders found on this page.
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-[0.18em] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pl-3 pr-4">ID</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Created at</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-zinc-100 text-xs text-zinc-700 last:border-0 dark:border-zinc-800 dark:text-zinc-200"
                >
                  <td className="py-2 pl-3 pr-4">{o.id}</td>
                  <td className="py-2 pr-4">{o.userId}</td>
                  <td className="py-2 pr-4">{o.status}</td>
                  <td className="py-2 pr-4">${o.totalAmount.toFixed(2)}</td>
                  <td className="py-2 pr-4">{o.createdAt}</td>
                  <td className="py-2 pr-3 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-[11px] outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <span>
            Page {page + 1} of {totalPages || 1}
          </span>
          <div className="space-x-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => handlePageChange(page - 1)}
              className="rounded-full border border-zinc-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="rounded-full border border-zinc-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
