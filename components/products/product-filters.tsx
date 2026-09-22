"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { tradeTypes } from "@/lib/site";
import { cn } from "@/lib/utils";

type ProductFiltersProps = {
  initialSearch: string;
  initialTrade: string;
  initialCategory: string;
};

export function ProductFilters({ initialSearch, initialTrade, initialCategory }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);

  function apply(next: { q?: string; trade?: string; category?: string }) {
    const params = new URLSearchParams();
    if (next.category ?? initialCategory) params.set("category", (next.category ?? initialCategory)!);
    if (next.q ?? search) params.set("q", (next.q ?? search)!);
    if (next.trade ?? initialTrade) params.set("trade", (next.trade ?? initialTrade)!);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  useEffect(() => {
    const timeout = setTimeout(() => apply({ q: search }), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-700/50" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rice, fertilizer, machinery…"
          className="h-12 w-full rounded-full border border-sand-200 bg-white pl-11 pr-4 text-sm text-forest-950 placeholder:text-forest-700/40 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
      </div>

      <div className="flex items-center gap-1 rounded-full border border-sand-200 bg-white p-1" role="group" aria-label="Trade type">
        <button
          type="button"
          onClick={() => apply({ trade: "" })}
          className={cn(
            "h-10 rounded-full px-4 text-sm font-medium transition-colors",
            !initialTrade ? "bg-forest-700 text-cream" : "text-forest-800 hover:bg-forest-100"
          )}
        >
          All
        </button>
        {tradeTypes.map((type) => {
          const active = initialTrade === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => apply({ trade: type.value })}
              className={cn(
                "h-10 rounded-full px-4 text-sm font-medium transition-colors",
                active ? "bg-forest-700 text-cream" : "text-forest-800 hover:bg-forest-100"
              )}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}