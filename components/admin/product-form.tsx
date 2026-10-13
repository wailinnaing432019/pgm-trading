"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import type { Category, Product } from "@prisma/client";
import { saveProduct, type AdminActionState } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SpecsEditor } from "@/components/admin/specs-editor";
import { AutoTranslateFormButton } from "@/components/admin/auto-translate-button";
import { useToast } from "@/components/admin/toast";

const initialState: AdminActionState = { ok: false };

type ProductWithTradeTypes = Omit<Product, "price"> & {
  price: number | null;
  tradeTypes: { tradeTypeId: string }[];
};

type TradeOption = { id: string; label: string };

function FieldError({
  fieldErrors,
  name,
}: {
  fieldErrors?: Record<string, string[] | undefined>;
  name: string;
}) {
  const message = fieldErrors?.[name]?.[0];
  return message ? (
    <p className="mt-1 text-xs font-medium text-soil-700" role="alert">
      {message}
    </p>
  ) : null;
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-6 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold text-forest-950">{title}</h2>
          {description ? <p className="mt-1 text-sm text-forest-700/60">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ProductForm({
  categories,
  tradeTypes = [],
  product,
}: {
  categories: Category[];
  tradeTypes?: TradeOption[];
  product?: ProductWithTradeTypes;
}) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveProduct, initialState);
  const { pushToast } = useToast();
  const checkedTypeIds = new Set(product?.tradeTypes.map((t) => t.tradeTypeId) ?? []);

  useEffect(() => {
    if (state.ok) {
      pushToast("success", product ? "Product updated." : "Product created.");
    } else if (state.error) {
      pushToast("error", state.error);
    }
  }, [state, product, pushToast]);

  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="id" value={product?.id} />

      {state.error ? (
        <p className="rounded-xl bg-soil-100 px-4 py-3 text-sm font-medium text-soil-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <Section
        title="Basics"
        description="Core product naming, short summary and commercial description."
        action={<AutoTranslateFormButton />}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Title *</label>
          <input name="title" required defaultValue={product?.title} className="input-admin" />
          <FieldError fieldErrors={state.fieldErrors} name="title" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Category *</label>
          <select name="categoryId" required defaultValue={product?.categoryId} className="input-admin">
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <FieldError fieldErrors={state.fieldErrors} name="categoryId" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Summary *</label>
          <input name="summary" required defaultValue={product?.summary} className="input-admin" />
          <FieldError fieldErrors={state.fieldErrors} name="summary" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Description *</label>
          <textarea name="description" required rows={6} defaultValue={product?.description} className="input-admin" />
          <FieldError fieldErrors={state.fieldErrors} name="description" />
        </div>
      </Section>

      <Section
        title="Trade types"
        description="Listing modes shown as badges — e.g. Export, Import, Rentable. A product can have several."
      >
        <div className="sm:col-span-2">
          {tradeTypes.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {tradeTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-sand-200 bg-cream px-4 py-3 transition-colors hover:border-forest-400 has-[:checked]:border-forest-700 has-[:checked]:bg-forest-50"
                >
                  <input
                    name="tradeTypeIds"
                    type="checkbox"
                    value={type.id}
                    defaultChecked={checkedTypeIds.has(type.id)}
                    className="h-4 w-4 rounded border-sand-300 accent-forest-700"
                  />
                  <span className="text-sm font-medium text-forest-900">{type.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-forest-700/60">
              No trade types yet — add them under{" "}
              <a href="/admin/trade-types" className="font-semibold text-forest-700 underline underline-offset-4">
                Trade Types
              </a>{" "}
              so products can be marked Export, Import, Rentable, etc.
            </p>
          )}
        </div>
      </Section>

      <Section title="Gallery" description="Photos shown on the product page and in the catalog.">
        <div className="sm:col-span-2">
          <ImageUploader name="images" label="Gallery images" multiple initial={product?.images ?? []} />
        </div>
      </Section>

      <Section title="Trade & pricing">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Status *</label>
          <select name="status" defaultValue={product?.status ?? "DRAFT"} className="input-admin">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
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
          <FieldError fieldErrors={state.fieldErrors} name="price" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Availability (stock)</label>
          <input
            name="availability"
            type="number"
            min="0"
            defaultValue={product?.availability ?? ""}
            placeholder="0 = out of stock (blank = unlimited)"
            className="input-admin"
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="isFeatured"
            name="isFeatured"
            type="checkbox"
            defaultChecked={product?.isFeatured}
            className="h-4 w-4 rounded border-sand-300 accent-forest-700"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-forest-900">
            Featured on homepage
          </label>
        </div>
      </Section>

      <Section
        title="Specifications & packaging"
        description="Shown as a details table on the public product page."
      >
        <div className="sm:col-span-2">
          <SpecsEditor initial={(product?.specs as Record<string, string> | undefined) ?? {}} />
        </div>
      </Section>

      <Section title="SEO" description="Optional — falls back to the title and summary.">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-forest-900">SEO title</label>
          <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} className="input-admin" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-forest-900">SEO description</label>
          <input name="seoDescription" defaultValue={product?.seoDescription ?? ""} className="input-admin" />
        </div>
      </Section>

      <div className="flex items-center gap-4 lg:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-8 text-sm font-semibold text-cream transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {product ? "Update product" : "Create product"}
        </button>
      </div>
    </form>
  );
}