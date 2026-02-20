"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCartForUser,
  removeItemFromCart,
  addItemToCart,
  updateCartStatus,
  clearCartForUser,
} from "../../lib/cart-api";
import { useCartStore } from "../../lib/cart-store";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "../../lib/user";
import { useToast } from "../../components/ui/toaster";
import {useRequireAuth} from "@/lib/use-require-auth";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const hydrateFromServer = useCartStore((state) => state.hydrateFromServer);
  const removeItemLocally = useCartStore((state) => state.removeItemLocally);
  const cartId = useCartStore((state) => state.cartId);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
    const { isHydrated, isAuthenticated, user } = useRequireAuth({
        redirectTo: `/login?redirect=${encodeURIComponent(`/cart`)}`,
    });
  useEffect(() => {

    getCartForUser(user?.data?.id)
      .then((res) => hydrateFromServer(res.data))
      .catch((error) => console.error("Failed to load cart", error))
      .finally(() => setLoading(false));
  }, [hydrateFromServer, router]);

  const handleRemove = async (cartItemId: number) => {
    try {
      const userId = user?.data.id;
      removeItemLocally(cartItemId);
      await removeItemFromCart({ userId, cartItemId });
      addToast("Item removed from cart", "success");
    } catch (error) {
      console.error("Failed to remove item from cart", error);
      addToast("Failed to remove item. Please try again.", "error");
    }
  };

  const handleChangeQuantity = async (
    cartItemId: number,
    productId: number,
    delta: number,
    currentQuantity: number
  ) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity <= 0) {
      await handleRemove(cartItemId);
      return;
    }

    try {
      const userId =user?.data.id;
      const response = await addItemToCart({
        userId,
        productId,
        quantity: delta,
      });
      const addOrUpdateItem = useCartStore.getState().addOrUpdateItem;
      addOrUpdateItem(response.data);
      addToast("Cart updated", "success");
    } catch (error) {
      console.error("Failed to update quantity", error);
      addToast("Failed to update quantity. Please try again.", "error");
    }
  };

  const handleClearCart = async () => {
    try {
      const userId = user?.data.id

      await clearCartForUser(userId);

      clearCart();

      addToast("Cart cleared", "success");
    } catch (error) {
      addToast("Failed to clear cart. Please try again.", "error");
    }
  };

  const handleProceedToCheckout = async () => {
    try {
      const userId = user?.data.id

      router.push("/checkout");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error during proceed to checkout", error);
      addToast("Something went wrong. Please try again.", "error");
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3">
          <div className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-950/60">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your cart is empty
        </h1>
        <p className="mx-auto max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Explore our latest products and add your favorites to the cart. Items you add will
          appear here so you can review them before checkout.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Shopping cart
        </h1>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  Product #{item.productId}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Quantity: {item.quantity}
                </p>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() =>
                      handleChangeQuantity(
                        item.id,
                        item.productId,
                        -1,
                        item.quantity
                      )
                    }
                    className="h-5 w-5 rounded-full border border-zinc-300 text-center text-xs leading-none text-zinc-700 hover:bg-zinc-200 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    -
                  </button>
                  <span className="min-w-[1.5rem] text-center font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleChangeQuantity(
                        item.id,
                        item.productId,
                        1,
                        item.quantity
                      )
                    }
                    className="h-5 w-5 rounded-full border border-zinc-300 text-center text-xs leading-none text-zinc-700 hover:bg-zinc-200 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  ${item.totalPrice.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-xs text-white hover:text-white font-semibold rounded-full bg-red-300 border border-red-400 px-3 py-1 transition hover:bg-red-400 dark:bg-red-700 dark:border-red-600 dark:text-white dark:hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Order summary
        </h2>
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Taxes and shipping are calculated at checkout.
        </p>
        <button
          type="button"
          onClick={handleProceedToCheckout}
          className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Proceed to checkout
        </button>
        <button
          type="button"
          onClick={handleClearCart}
          className="w-full text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Clear cart
        </button>
      </section>
    </div>
  );
}
