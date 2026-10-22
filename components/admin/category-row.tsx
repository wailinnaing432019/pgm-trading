"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteCategory, submitCategory } from "@/lib/actions/admin";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { CategoryFields } from "@/components/admin/category-fields";
import { CategoryVisibilityToggle } from "@/components/admin/category-visibility-toggle";
import { cn } from "@/lib/utils";

export type CategoryRowData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  isActive: boolean;
  _count: { products: number };
};

export function CategoryRow({
  category,
  position,
}: {
  category: CategoryRowData;
  position: number;
}) {
  const [editing, setEditing] = useState(false);
  const productCount = category._count.products;

  return (
    <>
      <tr className={cn("transition-colors hover:bg-sand-50", editing && "bg-sand-50/70")}>
        <td className="px-6 py-4">
          <p className="font-semibold text-forest-950">{category.name}</p>
          <code className="mt-0.5 block text-xs text-forest-700/60">/{category.slug}</code>
        </td>
        <td className="max-w-[320px] px-4 py-4 text-forest-800/80">
          {category.description ? (
            <p className="line-clamp-2 text-sm">{category.description}</p>
          ) : (
            <span className="text-forest-700/40">—</span>
          )}
        </td>
        <td className="px-4 py-4">
          <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-forest-800">
            {productCount}
          </span>
        </td>
        <td className="px-4 py-4">
          <CategoryVisibilityToggle
            id={category.id}
            name={category.name}
            isActive={category.isActive}
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-expanded={editing}
              aria-label={editing ? `Cancel editing ${category.name}` : `Edit ${category.name}`}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                editing
                  ? "bg-sand-200 text-forest-900 hover:bg-sand-300"
                  : "bg-forest-100 text-forest-700 hover:bg-forest-700 hover:text-cream"
              )}
            >
              {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </button>

            {productCount > 0 ? (
              <span
                title={`Move its ${productCount} product${productCount === 1 ? "" : "s"} first`}
                className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full bg-sand-100 text-forest-700/35"
              >
                <Trash2 className="h-4 w-4" />
              </span>
            ) : (
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <DangerSubmitButton
                  confirmText="Delete this category permanently?"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-soil-100 text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </DangerSubmitButton>
              </form>
            )}
          </div>
        </td>
      </tr>

      {editing ? (
        <tr className="bg-sand-50/70">
          <td colSpan={5} className="px-6 pb-6 pt-2">
            <form
              action={submitCategory}
              onSubmit={() => setEditing(false)}
              className="grid gap-4 rounded-xl border border-sand-200 bg-white p-5"
            >
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="position" value={String(position)} />

              <CategoryFields category={category} />

              <div className="flex items-center justify-end gap-2 border-t border-sand-200 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-forest-700 transition-colors hover:bg-sand-100"
                >
                  Cancel
                </button>
                <SubmitButton variant="primary" size="sm" pendingText="Saving…">
                  Save changes
                </SubmitButton>
              </div>
            </form>
          </td>
        </tr>
      ) : null}
    </>
  );
}
