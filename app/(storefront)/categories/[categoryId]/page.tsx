import { listProductsByCategory } from "../../../../lib/api";
import { ProductGrid } from "../../../../components/products/ProductGrid";
import { getCategoryById } from "../../../../lib/categories";

export default async function CategoryPage({
  params,
}: {
  params: { categoryId: string };
}) {
  const categoryId = Number(params.categoryId);
  if (!Number.isFinite(categoryId)) {
    return null;
  }

  const [productsResponse, categoryResponse] = await Promise.all([
    listProductsByCategory({ categoryId, page: 0, size: 12, sort: "price,asc" }),
    getCategoryById(categoryId).catch(() => null),
  ]);

  const page = productsResponse.data;
  const category = categoryResponse ? categoryResponse.data : null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Category
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {category ? category.name : `Category #${categoryId}`}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Products filtered by category from the backend.
        </p>
      </header>

      <ProductGrid
        products={page.content.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
        }))}
      />
    </div>
  );
}
