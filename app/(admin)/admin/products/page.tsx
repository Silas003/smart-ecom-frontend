"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "../../../../lib/api";
import { useAuthStore } from "../../../../lib/auth-store";
import { getAllCategories, type Category } from "../../../../lib/categories";
import { useToast } from "../../../../components/ui/toaster";

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isLoading, hydrate } = useAuthStore();
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{
    name: string;
    price: number;
    stockQuantity: number;
    categoryId: number;
  }>({ name: "", price: 0, stockQuantity: 0, categoryId: 0 });
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadPage = async (pageIndex: number) => {
    const res = await listProducts({ page: pageIndex, size: pageSize, sort: "price,asc" });
    setProducts(res.data.content);
    setTotalPages(res.data.totalPages);
    setPage(res.data.number);
  };

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/admin/products")}`);
      return;
    }
    if (user.userRole !== "admin") {
      router.push("/");
      return;
    }

    const load = async () => {
      try {
        await loadPage(0);
        const res = await getAllCategories();
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load products or categories", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setInitialLoading(false);
      }
    };

    load();
  }, [isLoading, router, user, hydrate]);

  const refresh = async () => {
    try {
      await loadPage(page);
    } catch (err) {
      console.error("Failed to load products", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
    }
  };

  if (isLoading || (!user && initialLoading)) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Products
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking permissions...</p>
      </div>
    );
  }

  const resetForm = () => {
    setForm({ name: "", price: 0, stockQuantity: 0, categoryId: 0 });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      if (editingId === null) {
        await createProduct(form);
        addToast("Product created", "success");
      } else {
        await updateProduct(editingId, form);
        addToast("Product updated", "success");
      }
      resetForm();
      await refresh();
    } catch (err) {
      const fallback = "Failed to save product.";
      const message = err instanceof Error ? err.message || fallback : fallback;
      setError(message);
      addToast(message, "error");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      stockQuantity: p.stockQuantity,
      categoryId: p.categoryId,
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addToast("Product deleted", "success");
    } catch (err) {
      console.error("Failed to delete product", err);
      const message = "Failed to delete product.";
      setError(message);
      addToast(message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Products
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Manage catalog
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Create and update products, prices, stock levels, and categories.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              {editingId === null ? "Create product" : `Edit product #${editingId}`}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Specify name, price, stock, and category. Changes are applied immediately.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            type="text"
            placeholder="Product name (e.g. Wireless Headphones)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price (e.g. 49.99)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            type="number"
            placeholder="Stock quantity (e.g. 100)"
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <select
            value={form.categoryId || ""}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (#{c.id})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {creating ? "Saving..." : editingId === null ? "Create product" : "Update product"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>Products</span>
          {initialLoading && <span>Loading...</span>}
        </div>
        {products.length === 0 && !initialLoading ? (
          <div className="px-3 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No products found on this page.
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-[0.18em] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pl-3 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Stock</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-zinc-100 text-xs text-zinc-700 last:border-0 dark:border-zinc-800 dark:text-zinc-200"
                >
                  <td className="py-2 pl-3 pr-4">{p.id}</td>
                  <td className="py-2 pr-4">{p.name}</td>
                  <td className="py-2 pr-4">${p.price.toFixed(2)}</td>
                  <td className="py-2 pr-4">{p.stockQuantity}</td>
                  <td className="py-2 pr-4">{p.categoryId}</td>
                  <td className="py-2 pr-3 space-x-2 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="rounded-full border border-zinc-300 px-3 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="rounded-full border border-red-300 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <span>
            Page {page + 1} of {totalPages || 1}
          </span>
          <div className="space-x-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => loadPage(page - 1).catch(() => {})}
              className="rounded-full border border-zinc-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => loadPage(page + 1).catch(() => {})}
              className="rounded-full border border-zinc-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
