"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrderById } from "../../../../lib/orders";

type ParamsInput = { id: string } | Promise<{ id: string }>;

type OrderItemApi = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
};

type OrderApi = {
  id: number;
  userId: number;
  status: string;
  totalAmount: number | null;
  items: OrderItemApi[];
  createdAt: string;
};

export default function OrderDetailPage({ params }: { params: ParamsInput }) {
  const resolved = params instanceof Promise ? use(params) : params;
  const router = useRouter();
  const numericId = Number(resolved.id);

  const [order, setOrder] = useState<OrderApi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      router.replace("/account/orders");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await getOrderById(numericId);
        // Normalise shape in case getOrderById wraps data
        const data = (res as any).data ?? res;
        if (!cancelled) {
          setOrder(data as OrderApi);
        }
      } catch (err) {
        console.error("Failed to load order", err);
        if (!cancelled) {
          router.replace("/account/orders");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [numericId, router]);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const safeTotal =
    typeof order.totalAmount === "number" ? order.totalAmount : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Order #{order.id}
      </h1>
      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            Status:{" "}
            <span className="capitalize text-zinc-900 dark:text-zinc-50">
              {order.status}
            </span>
          </span>
          <span>
            Total:{" "}
            <span className="text-zinc-900 dark:text-zinc-50">
              ${safeTotal.toFixed(2)}
            </span>
          </span>
          <span>
            Placed on:{" "}
            <span className="text-zinc-900 dark:text-zinc-50">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </span>
        </div>
        <div className="mt-2">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Items
          </h2>
          <div className="divide-y divide-zinc-200 text-xs dark:divide-zinc-800">
            {order.items?.map((item) => {
              const unit = typeof item.unitPrice === "number" ? item.unitPrice : 0;
              const total = typeof item.totalPrice === "number" ? item.totalPrice : 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Product #{item.productId}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {item.quantity} × ${unit.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-[11px] text-zinc-900 dark:text-zinc-50">
                    ${total.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
