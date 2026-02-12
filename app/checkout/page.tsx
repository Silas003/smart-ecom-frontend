"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "../../lib/cart-store";
import { getCurrentUserId } from "../../lib/user";
import { createOrder } from "../../lib/orders";
import { updateCartStatus } from "../../lib/cart-api";
import { useToast } from "../../components/ui/toaster";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartId = useCartStore((state) => state.cartId);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      const userId = getCurrentUserId();
      if (!userId) {
        router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
        return;
      }
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      await createOrder({ userId, items: orderItems });

      if (cartId) {
        try {
          await updateCartStatus({ cartId, body: { status: "checkout" } });
        } catch (error) {
          console.error("Failed to update cart status to checkout", error);
        }
      } else {
        console.warn("No cartId available when attempting to set cart status to checkout.");
      }

      clearCart();
      addToast("Order placed successfully", "success");
      router.push("/checkout/success");
    } catch (error) {
      console.error("Failed to place order", error);
      addToast("Something went wrong placing your order. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Nothing to checkout yet
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your cart is empty. Add some items before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Checkout
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Review your order before placing it.
        </p>
      </header>

      <div className="grid gap-10 md:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Items
          </h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.cartItemId ?? `${item.productId}-${item.quantity}`}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    Product #{item.productId}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  ${item.totalPrice.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Order summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Shipping</span>
              <span>Calculated at next step</span>
            </div>
          </div>
          <hr className="border-zinc-200 dark:border-zinc-800" />
          <div className="flex items-center justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </section>
      </div>
    </div>
  );
}
