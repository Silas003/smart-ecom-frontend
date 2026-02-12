import Link from "next/link";
import { ProductGrid } from "../components/products/ProductGrid";
import { listProducts } from "../lib/api";

export default async function Home() {
	let products = [] as {
		id: number;
		name: string;
		price: number;
	}[];

	try {
		const response = await listProducts({
			page: 0,
			size: 8,
			sort: "price,asc",
		});
		products = response.data.content;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Failed to load products for home page", error);
	}

	const featuredProducts =
		products.length > 0
			? products
			: [
					{
						id: 1,
						name: "Essential Cotton T-Shirt",
						price: 24.99,
					},
					{
						id: 2,
						name: "Slim Fit Denim Jeans",
						price: 59.99,
					},
					{
						id: 3,
						name: "Lightweight Hooded Jacket",
						price: 89.99,
					},
					{
						id: 4,
						name: "Everyday Sneakers",
						price: 74.99,
					},
			  ];

	return (
		<div className="space-y-10">
			<section className="grid gap-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-10 text-white shadow-lg sm:grid-cols-[3fr,2fr] sm:px-10 sm:py-14">
				<div className="space-y-6">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
						New Season
					</p>
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
						Discover essentials made for everyday comfort.
					</h1>
					<p className="max-w-xl text-sm text-zinc-300 sm:text-base">
						Shop a curated collection of wardrobe staples designed to mix, match,
						and move with you—from the first meeting of the day to the last
						coffee run at night.
					</p>
					<div className="flex flex-wrap gap-3 text-xs text-zinc-200">
						<span className="rounded-full bg-zinc-800/80 px-3 py-1">
							Free shipping over $75
						</span>
						<span className="rounded-full bg-zinc-800/80 px-3 py-1">
							30-day returns
						</span>
						<span className="rounded-full bg-zinc-800/80 px-3 py-1">
							Secure checkout
						</span>
					</div>
					<div className="flex flex-wrap gap-3 pt-2 text-sm font-medium">
						<Link
							href="/products"
							className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-zinc-900 shadow-sm transition hover:bg-zinc-100"
						>
							Shop collection
						</Link>
						<Link
							href="/products?sort=new"
							className="inline-flex items-center justify-center rounded-full border border-zinc-500/60 px-5 py-2 text-zinc-100 transition hover:border-zinc-300 hover:text-white"
						>
							View new arrivals
						</Link>
					</div>
				</div>
				<div className="flex flex-col justify-between gap-6 rounded-2xl bg-zinc-950/40 p-5 text-xs text-zinc-200 sm:p-6">
					<div className="space-y-3">
						<p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
							This week&apos;s highlights
						</p>
						<ul className="space-y-3">
							<li className="flex items-center justify-between">
								<span>Everyday tees 2 for $40</span>
								<span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
									Trending
								</span>
							</li>
							<li className="flex items-center justify-between">
								<span>New denim fits just dropped</span>
								<span className="text-[11px] text-zinc-400">
									Online exclusive
								</span>
							</li>
							<li className="flex items-center justify-between">
								<span>Members earn 2x points</span>
								<span className="text-[11px] text-zinc-400">Today only</span>
							</li>
						</ul>
					</div>
					<div className="space-y-2 rounded-xl bg-zinc-900/80 p-4">
						<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
							Summer Event
						</p>
						<p className="text-sm font-medium text-white">
							Up to 40% off select styles
						</p>
						<p className="text-[11px] text-zinc-400">
							Prices as marked. Limited-time offer on qualifying items only.
						</p>
					</div>
				</div>
			</section>

			<ProductGrid
				title="Featured picks"
				subtitle="Handpicked styles to kickstart your wardrobe refresh."
				products={featuredProducts.map((p) => ({
					id: p.id,
					name: p.name,
					price: p.price,
				}))}
			/>
		</div>
	);
}
