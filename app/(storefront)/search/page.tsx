import { ProductGrid } from "../../../components/products/ProductGrid";
import { listProducts } from "../../../lib/api";

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; sort?: string };
}) {
  const query = searchParams?.q?.trim() ?? "";
  const pageParam = Number(searchParams?.page ?? "1");
  const apiPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam - 1 : 0;
  const sort = searchParams?.sort || "price,asc";

  // Backend currently has no dedicated search endpoint; reuse listProducts for now.
  // In future, this can be swapped to a real /search API.
  const response = await listProducts({ page: apiPage, size: 12, sort });
  const page = response.data;

  const filtered = query
    ? page.content.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : page.content;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Search
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Results for &quot;{query || "All products"}&quot;
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {query
            ? "Showing products matching your search. This is a simple client-side filter over the list endpoint."
            : "No search term provided. Showing products from the main catalog."}
        </p>
      </header>

      <ProductGrid
        products={filtered.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
        }))}
      />
    </div>
  );
}
