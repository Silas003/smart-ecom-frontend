"use client";

import { useState } from "react";
import { addItemToCart } from "../../../../lib/cart-api";
import { useCartStore } from "../../../../lib/cart-store";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "../../../../lib/user";
import { createReview } from "../../../../lib/reviews";
import { useToast } from "../../../../components/ui/toaster";

export default function ProductDetailActions({ productId }: { productId: number }) {
  const [isAdding, setIsAdding] = useState(false);
  const addOrUpdateItem = useCartStore((state) => state.addOrUpdateItem);
  const router = useRouter();
  const { addToast } = useToast();

  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      const userId = getCurrentUserId();
      if (!userId) {
        router.push(`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`);
        return;
      }
      const response = await addItemToCart({ userId, productId, quantity: 1 });
      addOrUpdateItem(response.data);
      addToast("Added to cart", "success");
    } catch (error) {
      console.error("Failed to add product to cart", error);
      addToast("Failed to add to cart", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getCurrentUserId();
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }
    if (rating < 1 || rating > 10) {
      addToast("Rating must be between 1 and 10", "error");
      return;
    }
    try {
      setSubmittingReview(true);
      await createReview({ productId, userId, rating, description: description.trim() || undefined });
      setRating(0);
      setDescription("");
      addToast("Review submitted", "success");
    } catch (err) {
      console.error("Failed to submit review", err);
      const msg = err instanceof Error ? err.message : "Failed to submit review";
      addToast(msg, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-5 text-sm">
      {/* Primary actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 md:flex-none md:px-6"
        >
          {isAdding ? "Adding..." : "Add to cart"}
        </button>
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-900 md:flex-none md:px-6"
        >
          Save for later
        </button>
      </div>

      {/* Review form */}
      <form
        onSubmit={handleSubmitReview}
        className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-3 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Leave a review
          </p>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Share your experience (rating required)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-200">
              Rating
            </label>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              1 – 10
            </span>
          </div>
          <input
            type="number"
            min={1}
            max={10}
            value={rating || ""}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-16 rounded-full border border-zinc-300 bg-white px-2 py-1 text-center text-[11px] outline-none transition focus:border-zinc-500 focus:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
          />
        </div>

        <div className="space-y-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What did you like or dislike? This helps other shoppers."
            className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-[11px] outline-none transition focus:border-zinc-500 focus:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
          />
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Keep it honest and constructive. Avoid sharing personal or sensitive information.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={submittingReview}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submittingReview ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </form>
    </div>
  );
}
