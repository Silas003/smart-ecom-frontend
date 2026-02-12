"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { listProducts, type Product, type Page } from "../../../lib/api";
import { getAllCategories, type Category } from "../../../lib/categories";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams?.get("page");
  const currentPage = pageParam ? Number(pageParam) || 0 : 0;
  const pageSize = 12;

  // Read categoryId from the URL, e.g. /products?categoryId=3
  const categoryIdParam = searchParams?.get("categoryId");
  const categoryId = categoryIdParam ? Number(categoryIdParam) || undefined : undefined;

  const sortParam = searchParams?.get("sort") || "price,asc";
  const minParam = searchParams?.get("minPrice");
  const maxParam = searchParams?.get("maxPrice");
  const minPrice = minParam ? Number(minParam) || undefined : undefined;
  const maxPrice = maxParam ? Number(maxParam) || undefined : undefined;

  const [page, setPage] = useState<Page<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await listProducts({
          page: currentPage,
          size: pageSize,
          sort: sortParam,
          categoryId,
        });
        if (!cancelled) {
          setPage(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to load products. Please try again.";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentPage, categoryId, sortParam]);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await getAllCategories();
        if (!cancelled) {
          setCategories(res.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const goToPage = (pageIndex: number) => {
    const params = new URLSearchParams(searchParams ?? undefined);

    if (pageIndex <= 0) {
      params.delete("page");
    } else {
      params.set("page", String(pageIndex));
    }

    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams ?? undefined);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page");
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
  };

  const goToCategory = (nextCategoryId: number | "") => {
    updateParams({ categoryId: nextCategoryId === "" ? null : String(nextCategoryId) });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value });
  };

  const handlePriceFilterChange = (
    type: "minPrice" | "maxPrice",
    value: string
  ) => {
    const parsed = value.trim();
    updateParams({ [type]: parsed ? parsed : null });
  };

  // Derive the list we actually display: first filter by category on the current page,
  // then apply client-side price filtering. Backend still receives categoryId so that
  // when navigating directly to a category or paginating, data stays consistent.
  const categoryFiltered = page?.content.filter((p) => {
    if (categoryId != null && p.categoryId !== categoryId) return false;
    return true;
  });

  const filteredContent = (categoryFiltered ?? page?.content)?.filter((p) => {
    if (minPrice != null && p.price < minPrice) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          Products
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Browse our catalog
        </h1>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Filter by category
            </span>
            {loadingCategories && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Loading categories...
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => goToCategory("")}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                categoryId == null
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              }`}
            >
              All products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => goToCategory(category.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                  categoryId === category.id
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Sort By
            </span>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">

              <select
                value={sortParam}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-[11px] font-medium outline-none focus-visible:outline-none"
              >
                <option value="price,asc">Price · Low to high</option>
                <option value="price,desc">Price · High to low</option>
                <option value="name,asc">Name · A–Z</option>
                <option value="name,desc">Name · Z–A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && !page && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading products…</p>
      )}

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {page && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(filteredContent ?? page.content).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-4 text-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <div className="flex h-40 items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-400 transition group-hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:group-hover:bg-zinc-800">
                  Image
                </div>
                <div className="mt-3 space-y-1">
                  <p className="line-clamp-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {product.name}
                  </p>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Stock: {product.stockQuantity}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Page {page.number + 1} of {page.totalPages || 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={page.first}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={page.last}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
