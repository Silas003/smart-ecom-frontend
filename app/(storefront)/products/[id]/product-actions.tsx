"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useRequireAuth } from "@/lib/use-require-auth";
import { addItemToCart } from "@/lib/cart-api";
import { createReview } from "@/lib/reviews";
import { useToast } from "@/components/ui/toaster";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductDetailActionsProps {
    productId: number;
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({
                        value,
                        onChange,
                    }: {
    value: number;
    onChange: (v: number) => void;
}) {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} out of 10`}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill={star <= (hovered || value) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                        />
                    </svg>
                </button>
            ))}
            {value > 0 && (
                <span className="ml-2 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
          {value}/10
        </span>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailActions({ productId }: ProductDetailActionsProps) {
    const router = useRouter();
    const { addToast } = useToast();
    const addOrUpdateItem = useCartStore((state) => state.addOrUpdateItem);

    // Auth — the hook handles redirect if unauthenticated after hydration
    const { isHydrated, isAuthenticated, user } = useRequireAuth({
        redirectTo: `/login?redirect=${encodeURIComponent(`/products/${productId}`)}`,
    });

    // Cart state
    const [isAdding, setIsAdding] = useState(false);

    // Review state
    const [rating, setRating] = useState(0);
    const [description, setDescription] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // ── Render gate: don't show anything until auth is resolved ─────────────────
    // useRequireAuth will redirect unauthenticated users — this just prevents
    // a flash of the component before that redirect fires.
    if (!isHydrated || !isAuthenticated) {
        return (
            <div className="space-y-3">
                <div className="h-10 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            </div>
        );
    }

    // ── Handlers ─────────────────────────────────────────────────────────────────

    const handleAddToCart = async () => {
        console.log("handleAddToCart");
       const userId:Number = user?.data?.id;
        if (!userId) return;

        try {
            console.log("Adding to cart:", productId);
            setIsAdding(true);
            const response = await addItemToCart({ userId: userId, productId, quantity: 1 });
            console.log("Added to cart:", response);
            addOrUpdateItem(response.data);
            addToast("Added to cart", "success");
        } catch (error) {
            console.error("Failed to add product to cart:", error);
            addToast("Failed to add to cart. Please try again.", "error");
        } finally {
            setIsAdding(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) return;

        if (rating < 1 || rating > 10) {
            addToast("Please select a rating between 1 and 10.", "error");
            return;
        }

        try {
            setIsSubmittingReview(true);
            await createReview({
                productId,
                userId: user.id,
                rating,
                description: description.trim() || undefined,
            });
            setRating(0);
            setDescription("");
            addToast("Review submitted — thank you!", "success");
        } catch (err) {
            console.error("Failed to submit review:", err);
            const message = err instanceof Error ? err.message : "Failed to submit review.";
            addToast(message, "error");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // ── UI ────────────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5 text-sm">
            {/* Primary actions */}
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 md:flex-none md:px-6"
                >
                    {isAdding ? (
                        <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent" />
                            Adding...
                        </>
                    ) : (
                        "Add to cart"
                    )}
                </button>

                <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-900 md:flex-none md:px-6"
                >
                    Save for later
                </button>
            </div>

            {/* Review form */}
            <form
                onSubmit={handleSubmitReview}
                className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
                <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        Leave a review
                    </p>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Rating required
          </span>
                </div>

                {/* Star rating */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        Your rating
                    </label>
                    <div className="text-amber-400">
                        <StarRating value={rating} onChange={setRating} />
                    </div>
                </div>

                {/* Review text */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        Your thoughts{" "}
                        <span className="font-normal text-zinc-400">(optional)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        placeholder="What did you like or dislike? This helps other shoppers."
                        className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500 dark:focus:bg-zinc-950"
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            Keep it honest. Avoid sharing personal information.
                        </p>
                        <span className="text-[10px] tabular-nums text-zinc-400 dark:text-zinc-600">
              {description.length}/1000
            </span>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmittingReview || rating === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-[12px] font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                        {isSubmittingReview ? (
                            <>
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent" />
                                Submitting...
                            </>
                        ) : (
                            "Submit review"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}