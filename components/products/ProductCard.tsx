"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { addItemToCart } from "../../lib/cart-api";
import { useCartStore } from "../../lib/cart-store";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "../../lib/user";

export type ProductCardProps = {
  id: string | number;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
};

export function ProductCard({ id, name, price, imageUrl, description }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addOrUpdateItem = useCartStore((state) => state.addOrUpdateItem);
  const router = useRouter();

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      const userId = getCurrentUserId();
      if (!userId) {
        router.push(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`);
        return;
      }
      const response = await addItemToCart({ userId, productId: Number(id), quantity: 1 });
      addOrUpdateItem(response.data);
    } catch (error) {
      console.error("Failed to add to cart", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <Link href={`/products/${id}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${id}`} className="line-clamp-2 text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-50">
          {name}
        </Link>
        {description && (
          <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            ${price.toFixed(2)}
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isAdding ? "Adding..." : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
