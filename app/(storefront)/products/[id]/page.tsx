import { notFound } from "next/navigation";
import { getProductById } from "../../../../lib/api";
import ProductDetailActions from "./product-actions";
import { getReviewsForProduct } from "../../../../lib/reviews";

interface ProductPageParams {
  id: string;
}

async function renderProductPage(id: string) {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    notFound();
  }

  const [productResponse, reviewsResponse] = await Promise.all([
    getProductById(numericId),
    getReviewsForProduct(numericId),
  ]);

  const product = productResponse.data;
  const reviews = reviewsResponse.data;
  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
      <section className="rounded-3xl bg-zinc-100 p-4 dark:bg-zinc-900">
        <div className="flex h-80 items-center justify-center rounded-2xl bg-zinc-200 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Product image placeholder
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Product
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h1>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <p>
            This is a placeholder description for{" "}
            <span className="font-medium">{product.name}</span>. Once product
            descriptions are available from the backend, they will be displayed
            here.
          </p>
          <p>
            Stock:{" "}
            <span className="font-medium">{product.stockQuantity}</span> units
            available.
          </p>
        </div>

        <ProductDetailActions productId={product.id} />

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <p className="font-semibold text-zinc-800 dark:text-zinc-100">
            Shipping & returns
          </p>
          <ul className="mt-2 space-y-1">
            <li>Free standard shipping over $75</li>
            <li>30-day free returns on unworn items</li>
            <li>Secure checkout and buyer protection included</li>
          </ul>
        </div>
      </section>

      <section className="md:col-span-2 space-y-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Customer reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-200">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      <span>{"★".repeat(review.rating)}</span>
                      <span className="text-zinc-400 dark:text-zinc-500">
                        ({review.rating}/10)
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                    {review.description}
                  </p>
                  <p className="mt-2 text-[8px] text-zinc-600 dark:text-zinc-300 font-semibold">
                    {review.reviewerDisplay}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default async function ProductPage(
  props: { params: ProductPageParams } | { params: Promise<ProductPageParams> }
) {
  const resolvedParams =
    props.params instanceof Promise ? await props.params : props.params;
  return await renderProductPage(resolvedParams.id);
}
