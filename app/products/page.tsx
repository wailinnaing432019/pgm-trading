import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { getCategories, getProducts } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products & Commodities Catalog",
  description:
    "Browse Myanmar agricultural exports and imports — fresh crops, grains, fertilizers, machinery and cold-chain logistics.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; trade?: string; q?: string }>;
}) {
  const { category = "", trade = "", q = "" } = await searchParams;
  const validTrade = ["EXPORT", "IMPORT", "BOTH"].includes(trade) ? trade : undefined;

  const [categories, catalog] = await Promise.all([
    getCategories(),
    getProducts({
      category: category || undefined,
      tradeType: validTrade as "EXPORT" | "IMPORT" | "BOTH" | undefined,
      q: q || undefined,
      limit: 24,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <main>
        {/* Page hero */}
        <section className="border-b border-sand-200 bg-forest-950 py-14 text-cream md:py-20">
          <div className="grain pointer-events-none absolute inset-0" aria-hidden />
          <div className="section-container relative">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-400">Catalog</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">Products & Commodities</h1>
            <p className="mt-4 max-w-2xl text-cream/70">
              Graded exports and sourced imports, ready for enquiry. Filter by category, search by name,
              or narrow by export/import availability.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-sand-200 bg-cream py-6">
          <div className="section-container flex flex-col gap-5">
            <ProductFilters
              initialSearch={q}
              initialTrade={trade}
              initialCategory={category}
            />

            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Categories">
              <Link
                href="/products"
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  !category ? "bg-forest-700 text-cream" : "bg-white text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50"
                )}
              >
                All Categories
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    category === c.slug ? "bg-forest-700 text-cream" : "bg-white text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50"
                  )}
                >
                  {c.name}
                  <span className="ml-1.5 text-xs opacity-60">{c._count.products}</span>
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* Results */}
        <section className="bg-sand-50 py-16">
          <div className="section-container">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-2xl font-semibold text-forest-950">
                {activeCategory?.name ?? "All Products"}
              </h2>
              <span className="text-sm text-forest-700/60">{catalog.total} result{catalog.total === 1 ? "" : "s"}</span>
            </div>

            {catalog.items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {catalog.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-sand-300 bg-white/60 px-6 py-20 text-center">
                <p className="font-serif text-xl font-semibold text-forest-950">No products found</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-forest-800/70">
                  Try a different search term or category, or <Link href="/contact" className="font-semibold text-forest-700 underline underline-offset-4">contact us</Link> and we&apos;ll source it for you.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
  );
}