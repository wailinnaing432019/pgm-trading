import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { getCategories, getProducts, getTradeTypes } from "@/lib/queries";
import { CategoryCard } from "@/components/categories/category-card";

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

  const tradeTypes = await getTradeTypes();
  const validTrade = tradeTypes.some((t) => t.id === trade);

  const [categories, catalog] = await Promise.all([
    getCategories(),
    getProducts({
      category: category || undefined,
      tradeType: validTrade ? trade : undefined,
      q: q || undefined,
      limit: 24,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  function makeCategoryHref(catSlug: string) {
    const params = new URLSearchParams();
    if (catSlug) params.set("category", catSlug);
    if (validTrade && trade) params.set("trade", trade);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

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
              initialTrade={validTrade ? trade : ""}
              initialCategory={category}
              tradeTypes={tradeTypes.map((t) => ({ id: t.id, label: t.label }))}
            />

            {/* Category cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pt-2">
              {/* All Categories card */}
              <CategoryCard
                category={{
                  id: "all",
                  name: "All Categories",
                  slug: "",
                  image: undefined,
                  _count: { products: catalog.total },
                }}
                isActive={!category}
                href={makeCategoryHref("")}
              />

              {categories.map((c) => (
                <CategoryCard
                  key={c.id}
                  category={c}
                  isActive={category === c.slug}
                  href={makeCategoryHref(c.slug)}
                />
              ))}
            </div>
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