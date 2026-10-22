import Link from "next/link";
import { FolderTree, SearchX } from "lucide-react";
import { getAdminCategories } from "@/lib/queries";
import { submitCategory } from "@/lib/actions/admin";
import { AddEntryDrawer } from "@/components/admin/collection-client-wrappers";
import { SubmitButton } from "@/components/admin/submit-button";
import { CategoryFields } from "@/components/admin/category-fields";
import { CategoryRow } from "@/components/admin/category-row";
import { SearchBox } from "@/components/admin/search-box";
import { cn } from "@/lib/utils";

const statusFilters = [
  { value: "", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
] as const;

type StatusFilter = (typeof statusFilters)[number]["value"];

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const activeStatus: StatusFilter =
    status === "visible" || status === "hidden" ? status : "";

  const allCategories = await getAdminCategories();
  const categories = await getAdminCategories({
    q,
    status: activeStatus || undefined,
  });
  const isFiltered = Boolean(q.trim()) || activeStatus !== "";
  const nextPosition = allCategories.reduce(
    (max, category) => Math.max(max, category.position + 1),
    0
  );

  function filterHref(nextStatus: StatusFilter) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (nextStatus) params.set("status", nextStatus);
    const query = params.toString();
    return query ? `/admin/categories?${query}` : "/admin/categories";
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-950">Categories</h1>
          <p className="mt-1 text-sm text-forest-700/70">
            Organize the product catalog into filterable groups.
          </p>
        </div>
        <span className="flex items-center gap-2 text-sm font-medium text-forest-700">
          <FolderTree className="h-4 w-4" aria-hidden /> {categories.length}{" "}
          {isFiltered ? `of ${allCategories.length}` : "total"}
        </span>
      </div>

      <div className="mt-6">
        <AddEntryDrawer addLabel="Add category">
          <form action={submitCategory} className="grid gap-4">
            <input type="hidden" name="position" value={String(nextPosition)} />
            <CategoryFields />
            <div className="flex items-center justify-end border-t border-sand-200/80 pt-4">
              <SubmitButton variant="gold" pendingText="Creating…">
                Create category
              </SubmitButton>
            </div>
          </form>
        </AddEntryDrawer>
      </div>

      <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchBox
          basePath="/admin/categories"
          placeholder="Search name, slug or description…"
        />
        <div
          className="flex items-center gap-1 rounded-full border border-sand-200 bg-white p-0.5"
          role="group"
          aria-label="Filter by visibility"
        >
          {statusFilters.map((filter) => {
            const active = activeStatus === filter.value;
            return (
              <Link
                key={filter.value || "all"}
                href={filterHref(filter.value)}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-forest-700 text-cream"
                    : "text-forest-700 hover:bg-forest-50 hover:text-forest-950"
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200 text-xs uppercase tracking-wider text-forest-700/60">
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-4 py-3.5 font-semibold">Description</th>
                <th className="px-4 py-3.5 font-semibold">Products</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <CategoryRow key={category.id} category={category} position={index} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    {isFiltered ? (
                      <>
                        <SearchX className="mx-auto h-10 w-10 text-forest-700/40" aria-hidden />
                        <p className="mt-3 font-serif text-lg font-semibold text-forest-950">
                          No categories match
                        </p>
                        <p className="mt-1 text-sm text-forest-700/70">
                          Try another search term or{" "}
                          <Link
                            href="/admin/categories"
                            className="font-semibold text-forest-700 underline underline-offset-4"
                          >
                            clear the filters
                          </Link>
                          .
                        </p>
                      </>
                    ) : (
                      <>
                        <FolderTree className="mx-auto h-10 w-10 text-forest-700/40" aria-hidden />
                        <p className="mt-3 font-serif text-lg font-semibold text-forest-950">
                          No categories yet
                        </p>
                        <p className="mt-1 text-sm text-forest-700/70">
                          Add your first category with the button above.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
