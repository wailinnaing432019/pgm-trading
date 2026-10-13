import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category, Product, TradeType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { AssetImage } from "@/components/ui/asset-image";

export type ProductWithCategory = Omit<Product, "price"> & {
  category: Category | null;
  tradeTypes: { tradeType: TradeType }[];
  price: number | null;
};

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const tradeLabels = product.tradeTypes.map((t) => t.tradeType.label);

  return (
    <Link
      href={`/products/${product.id}`}
      className="card-surface group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <AssetImage
          src={product.images[0]}
          alt={product.title}
          placeholderIcon={product.category?.slug === "machinery" ? "crop" : "leaf"}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {tradeLabels.length > 0 ? (
          <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
            {tradeLabels.map((label) => (
              <Badge key={label} tone="forest">
                {label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-soil-600">
          {product.category?.name}
        </p>
        <h3 className="mt-1.5 font-serif text-lg font-semibold leading-snug text-forest-950">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest-800/75">
          {product.summary}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-forest-700/60">
              {product.unit ? `Indicative / ${product.unit}` : "Enquire for pricing"}
            </p>
            {product.price !== null ? (
              <p className="font-serif text-xl font-semibold text-forest-900">
                USD {product.price.toLocaleString()}
              </p>
            ) : (
              <p className="font-serif text-base font-semibold text-forest-900">On request</p>
            )}
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition-colors group-hover:bg-gold-500 group-hover:text-forest-950">
            <ArrowUpRight className="h-5 w-5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}