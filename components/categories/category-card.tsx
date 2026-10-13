import Link from "next/link";
import { AssetImage } from "@/components/ui/asset-image";
import { cn } from "@/lib/utils";

export interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    _count?: { products: number };
  };
  isActive?: boolean;
  href?: string;
}

/**
 * CategoryCard – displays a category with thumbnail image and active state.
 * Uses `relative` container positioning so AssetImage's fill layout is strictly bounded.
 */
export function CategoryCard({
  category,
  isActive = false,
  href,
}: CategoryCardProps) {
  const targetHref = href ?? (category.slug ? `/products?category=${category.slug}` : "/products");

  return (
    <Link
      href={targetHref}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isActive
          ? "border-forest-700 bg-forest-50/80 ring-2 ring-forest-700/50 shadow-sm"
          : "border-sand-200 bg-white hover:border-sand-300"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-sand-100">
        <AssetImage
          src={category.image}
          alt={category.name}
          placeholderIcon="leaf"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {category._count !== undefined ? (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-forest-950/75 px-1.5 py-0.5 text-[10px] font-medium text-cream backdrop-blur-sm">
            {category._count.products}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-1">
        <h3
          className={cn(
            "truncate text-xs font-semibold sm:text-sm",
            isActive ? "text-forest-950 font-bold" : "text-forest-900 group-hover:text-forest-700"
          )}
        >
          {category.name}
        </h3>
        {isActive && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest-700" aria-label="Active" />
        )}
      </div>
    </Link>
  );
}

export default CategoryCard;
