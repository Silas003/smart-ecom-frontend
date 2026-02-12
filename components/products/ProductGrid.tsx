import { ProductCard, type ProductCardProps } from "./ProductCard";

export type ProductGridProps = {
  title?: string;
  subtitle?: string;
  products: ProductCardProps[];
};

export function ProductGrid({ title, subtitle, products }: ProductGridProps) {
  return (
    <section className="space-y-4">
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          {subtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>
      )}
      {products.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No products to show yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </section>
  );
}
