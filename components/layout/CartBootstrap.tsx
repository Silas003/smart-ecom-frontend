"use client";

import { useEffect } from "react";
import { useCartStore } from "../../lib/cart-store";
import { getCartForUser } from "../../lib/cart-api";
import { getCurrentUserId } from "../../lib/user";

/**
 * CartBootstrap keeps the in-memory cart store in sync with the backend
 * when a user first visits the site (or refreshes).
 */
export default function CartBootstrap() {
  const hydrateFromServer = useCartStore((state) => state.hydrateFromServer);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;

    getCartForUser(userId)
      .then((res) => {
        hydrateFromServer(res.data);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to bootstrap cart from backend", err);
      });
  }, [hydrateFromServer]);

  return null;
}
