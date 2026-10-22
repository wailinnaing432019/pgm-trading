import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    _count?: { products: number };
  };
  isActive?: boolean;
  href?: string;
}

/**
 * CategoryCard – simple text pill for a catalog category with an active state.
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
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
        isActive
          ? "border-forest-700 bg-forest-700 text-cream"
          : "border-sand-300 bg-white text-forest-900 hover:border-forest-600 hover:bg-forest-50"
      )}
    >
      <span>{category.name}</span>
      {category._count !== undefined ? (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
            isActive ? "bg-cream/20 text-cream" : "bg-sand-100 text-forest-700"
          )}
        >
          {category._count.products}
        </span>
      ) : null}
    </Link>
  );
}

export default CategoryCard;
