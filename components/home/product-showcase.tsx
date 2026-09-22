import { ArrowRight } from "lucide-react";
import type { ProductWithCategory } from "@/components/products/product-card";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSection } from "@/lib/queries";

export async function ProductShowcase({ products }: { products: ProductWithCategory[] }) {
  const heading = await getSection("home", "productHeading");
  if (products.length === 0) return null;

  return (
    <section className="bg-sand-50 py-20 md:py-28">
      <div className="section-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={heading?.subtitle ?? "Featured Products"}
            title={heading?.title ?? "Commodities moving right now"}
            description={
              heading?.body ??
              "A selection of our in-demand export and import products — graded, milled and shipped to specification."
            }
          />
          <Button href="/products" variant="outline" className="shrink-0">
            Browse Catalog <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}