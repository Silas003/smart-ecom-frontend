import Link from "next/link";
import { getOrderById } from "../../../lib/orders";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: { orderId?: string; cartId?: string };
}) {
  const orderIdParam = searchParams?.orderId;
  const orderId = orderIdParam ? Number(orderIdParam) : NaN;

  let order = null;
  if (Number.isFinite(orderId)) {
    try {
      const response = await getOrderById(orderId);
      order = response.data;
    } catch (error) {
      console.error("Failed to load order", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Thank you for your order
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your order has been placed successfully. A confirmation email will be sent shortly.
        </p>
      </div>

      {order && (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          <p>
            <span className="font-medium">Order ID:</span> {order.id}
          </p>
          <p>
            <span className="font-medium">Status:</span> {order.status}
          </p>
          <p>
            <span className="font-medium">Total:</span> ${order.totalAmount.toFixed(2)}
          </p>
        </div>
      )}

      <div className="flex gap-3 text-sm">
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Continue shopping
        </Link>
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
        >
          View my orders
        </Link>
      </div>
    </div>
  );
}
