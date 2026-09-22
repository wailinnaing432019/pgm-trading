"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import type { Category, Product } from "@prisma/client";
import { saveProduct, type AdminActionState } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";

const initialState: AdminActionState = { ok: false };

type EditProduct = Omit<Product, "price"> & { price: number | null };

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: EditProduct;
}) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveProduct, initialState);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-2">
      <input type="hidden" name="id" value={product?.id} />
      <input type="hidden" name="specs" value={JSON.stringify(product?.specs ?? {})} />

      <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Title *</label>
          <input name="title" required defaultValue={product?.title} className="input-admin" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Slug *</label>
          <input name="slug" required defaultValue={product?.slug} placeholder="myanmar-jasmine-rice" className="input-admin" />
        </div>
      </div>

      <div className="lg:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Summary *</label>
        <input name="summary" required defaultValue={product?.summary} className="input-admin" />
      </div>

      <div className="lg:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Description *</label>
        <textarea name="description" required rows={6} defaultValue={product?.description} className="input-admin" />
      </div>

      <div className="lg:col-span-2">
        <ImageUploader name="images" label="Gallery images" multiple initial={product?.images ?? []} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Category *</label>
        <select name="categoryId" required defaultValue={product?.categoryId} className="input-admin">
          <option value="">Select…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Trade type *</label>
        <select name="tradeType" defaultValue={product?.tradeType ?? "EXPORT"} className="input-admin">
          <option value="EXPORT">Export</option>
          <option value="IMPORT">Import</option>
          <option value="BOTH">Import & Export</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Origin</label>
        <input name="origin" defaultValue={product?.origin ?? ""} placeholder="Myanmar" className="input-admin" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Unit</label>
        <input name="unit" defaultValue={product?.unit ?? ""} placeholder="MT / Unit / Bag" className="input-admin" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Price (USD)</label>
        <input name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ""} className="input-admin" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Availability (stock)</label>
        <input name="availability" type="number" min="0" defaultValue={product?.availability ?? ""} placeholder="0 = out of stock" className="input-admin" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Status *</label>
        <select name="status" defaultValue={product?.status ?? "DRAFT"} className="input-admin">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input id="isFeatured" name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured} className="h-4 w-4 rounded border-sand-300 accent-forest-700" />
        <label htmlFor="isFeatured" className="text-sm font-medium text-forest-900">Featured on homepage</label>
      </div>

      <div className="lg:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-forest-900">SEO title</label>
        <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} className="input-admin" />
      </div>

      <div className="lg:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-forest-900">SEO description</label>
        <input name="seoDescription" defaultValue={product?.seoDescription ?? ""} className="input-admin" />
      </div>

      <div className="flex items-center gap-4 lg:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-8 text-sm font-semibold text-cream transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {product ? "Update product" : "Create product"}
        </button>
        {state.ok ? (
          <p className="text-sm font-medium text-forest-700" role="status">Saved. The public catalog has been refreshed.</p>
        ) : state.error ? (
          <p className="text-sm text-soil-700" role="alert">{state.error}</p>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-forest-700/60 lg:col-span-2">
        Product specs are stored as structured JSON, e.g.{" "}
        <code className="rounded bg-sand-100 px-1">{"{packaging: '50kg bags', moisture: '≤14%'}"}</code>.
      </p>
    </form>
  );
}