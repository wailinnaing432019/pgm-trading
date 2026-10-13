import Link from "next/link";
import { Pencil, Plus, PackageSearch, Trash2 } from "lucide-react";
import { getAdminProducts } from "@/lib/queries";
import { deleteProduct } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";
import { SearchBox } from "@/components/admin/search-box";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getAdminProducts(q ?? "");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-950">Products</h1>
          <p className="mt-1 text-sm text-forest-700/70">Create, edit, publish and archive catalog items.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add Product
        </Link>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <SearchBox basePath="/admin/products" placeholder="Search by title or summary…" />
          <p className="text-sm text-forest-700/60">
            {products.length} product{products.length === 1 ? "" : "s"}
            {q ? ` matching “${q}”` : ""}
          </p>
        </div>
        <div className="card-surface overflow-x-auto">
          {products.length > 0 ? (
            <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand-200 text-xs uppercase tracking-wider text-forest-700/60">
                <th className="px-6 py-3.5 font-semibold">Product</th>
                <th className="px-4 py-3.5 font-semibold">Category</th>
                <th className="px-4 py-3.5 font-semibold">Trade</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Updated</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-sand-50">
                  <td className="px-6 py-4">
                    <Link href={`/products/${p.id}`} className="font-semibold text-forest-950 hover:text-forest-700">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-forest-800/80">{p.category?.name}</td>
                  <td className="px-4 py-4 text-forest-800/80">
                    {p.tradeTypes.map((t) => t.tradeType.label).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={p.status === "PUBLISHED" ? "forest" : p.status === "ARCHIVED" ? "soil" : "neutral"}>
                      {p.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-forest-800/70">{formatDate(p.updatedAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition-colors hover:bg-forest-700 hover:text-cream"
                        aria-label={`Edit ${p.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <DangerSubmitButton
                          confirmText="Delete this product permanently?"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-soil-100 text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </DangerSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <PackageSearch className="h-10 w-10 text-forest-700/40" aria-hidden />
            <p className="font-serif text-lg font-semibold text-forest-950">No products yet</p>
            <Link href="/admin/products/new" className="text-sm font-semibold text-forest-700 underline underline-offset-4">
              Add your first product
            </Link>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}