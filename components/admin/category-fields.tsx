export type CategoryFieldValues = {
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
};

export function CategoryFields({ category }: { category?: CategoryFieldValues | null }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Name *</label>
          <input
            name="name"
            required
            defaultValue={category?.name ?? ""}
            placeholder="e.g. Rice & Grains"
            className="input-admin"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Slug *</label>
          <input
            name="slug"
            required
            defaultValue={category?.slug ?? ""}
            placeholder="rice-grains"
            className="input-admin"
          />
          <p className="mt-1 text-xs text-forest-700/60">Used in catalog filter URLs.</p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={category?.description ?? ""}
          placeholder="Short summary shown to staff and on the catalog page."
          className="input-admin"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={category ? category.isActive : true}
          className="h-4 w-4 rounded border-sand-300 accent-forest-700"
        />
        <span className="text-sm font-medium text-forest-900">Visible on site</span>
      </label>
    </>
  );
}
