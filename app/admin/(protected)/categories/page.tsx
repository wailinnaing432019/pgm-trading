import { FolderTree, Trash2 } from "lucide-react";
import { getAdminCategories } from "@/lib/queries";
import { submitCategory, deleteCategory } from "@/lib/actions/admin";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";
import { ImageUploader } from "@/components/ui/image-uploader";

type CategoryAdmin = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  position: number;
  isActive: boolean;
  _count: { products: number };
};

async function CategoryEditor({
  category,
  position,
  isNew = false,
}: {
  category?: CategoryAdmin;
  position: number;
  isNew?: boolean;
}) {
  const deleteFormId = category ? `delete-category-${category.id}` : "";
  const productCount = category?._count.products ?? 0;

  return (
    <div
      className={`card-surface grid gap-4 p-5 ${isNew ? "border-2 border-dashed border-sand-300" : ""}`}
    >
      <form action={submitCategory} className="grid gap-4">
        {category ? <input type="hidden" name="id" value={category.id} /> : null}
        <input type="hidden" name="position" value={String(position)} />

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Name *</label>
            <input name="name" required defaultValue={category?.name ?? ""} className="input-admin" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Slug *</label>
            <input name="slug" required defaultValue={category?.slug ?? ""} className="input-admin" />
            <p className="mt-1 text-xs text-forest-700/60">Used in catalog filter links.</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={category?.description ?? ""}
            className="input-admin"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px]">
          <ImageUploader
            name="image"
            label="Category image"
            initial={category?.image ? [category.image] : []}
          />
          <div className="flex flex-col justify-between gap-3">
            <label className="flex items-center gap-2 pt-5">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={category ? category.isActive : true}
                className="h-4 w-4 rounded border-sand-300 accent-forest-700"
              />
              <span className="text-sm font-medium text-forest-900">Visible on site</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 pt-4">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full bg-forest-100 px-5 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-700 hover:text-cream"
          >
            Save
          </button>

          {isNew ? null : productCount > 0 ? (
            <span className="text-sm text-forest-700/60">
              {productCount} product{productCount === 1 ? "" : "s"} in this category — move them before deleting.
            </span>
          ) : (
            <DangerSubmitButton
              form={deleteFormId}
              confirmText="Delete this category permanently? Products stay untouched if it is empty."
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-soil-100 px-3 text-sm font-semibold text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </DangerSubmitButton>
          )}
        </div>
      </form>

      {!isNew ? (
        <form id={deleteFormId} action={deleteCategory} hidden>
<input type="hidden" name="id" value={category?.id ?? ""} />
        </form>
      ) : null}
    </div>
  );
}

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-950">Categories</h1>
          <p className="mt-1 text-sm text-forest-700/70">
            Organize the product catalog into filterable groups.
          </p>
        </div>
        <span className="flex items-center gap-2 text-sm font-medium text-forest-700">
          <FolderTree className="h-4 w-4" aria-hidden /> {categories.length} total
        </span>
      </div>

      <div className="mt-8 grid gap-5">
        {categories.map((category, index) => (
          <CategoryEditor key={category.id} category={category} position={index} />
        ))}

        <CategoryEditor position={categories.length} isNew />
      </div>
    </div>
  );
}