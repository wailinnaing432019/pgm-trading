"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Coins,
  Images,
  Loader2,
  Package,
  Save,
  Sliders,
  Sparkles,
  Star,
  Tags,
} from "lucide-react";
import type { Category, Product } from "@prisma/client";
import { saveProduct, type AdminActionState } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SpecsEditor } from "@/components/admin/specs-editor";
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
    <p className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
      {message}
    </p>
  ) : null;
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
  const [state, action, pending] = useActionState<AdminActionState, FormData>(
    saveProduct,
    initialState
  );
  const { pushToast } = useToast();

  const productSpecs = (product?.specs as Record<string, string> | undefined) ?? {};
  const [title, setTitle] = useState(product?.title ?? "");
  const [currency, setCurrency] = useState(productSpecs.currency || "USD");
  const [price, setPrice] = useState<string>(product?.price !== null && product?.price !== undefined ? String(product.price) : "");
  const [unit, setUnit] = useState(product?.unit ?? "MT");
  const [origin, setOrigin] = useState(product?.origin ?? "Myanmar");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    product?.status ?? "DRAFT"
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(product?.isFeatured ?? false);
  const [selectedTradeTypes, setSelectedTradeTypes] = useState<Set<string>>(
    new Set(product?.tradeTypes.map((t) => t.tradeTypeId) ?? [])
  );

  const initialSpecsWithoutCurrency = useMemo(() => {
    const copy = { ...((product?.specs as Record<string, string> | undefined) ?? {}) };
    delete copy.currency;
    return copy;
  }, [product?.specs]);

  useEffect(() => {
    if (state.ok) {
      pushToast("success", product ? "Product updated successfully." : "New product published.");
    } else if (state.error) {
      pushToast("error", state.error);
    } else if (state.fieldErrors) {
      const firstError = Object.values(state.fieldErrors).flat().find(Boolean);
      if (firstError) pushToast("error", firstError);
    }
  }, [state, product, pushToast]);

  const toggleTradeType = (id: string) => {
    setSelectedTradeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Live formatted price string for the preview pill
  const formattedPricePreview = useMemo(() => {
    if (!price || Number.isNaN(Number(price))) {
      return "FOB Pricing Upon Inquiry";
    }
    const num = Number(price);
    const currStr = currency.trim().toUpperCase() || "USD";
    const unitStr = unit.trim() ? ` / ${unit.trim().replace(/^\/+/, "")}` : "";
    return `${currStr} ${num.toLocaleString()}${unitStr}`;
  }, [price, currency, unit]);

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="id" value={product?.id} />

      {/* Top Header / Sticky Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-sand-200/80 pb-6">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-700/70 hover:text-forest-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to products
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl font-semibold text-forest-950 sm:text-3xl">
              {product ? `Edit Product: ${product.title}` : "Add New Product"}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-800"
                  : status === "ARCHIVED"
                  ? "bg-sand-200 text-forest-800/70"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === "PUBLISHED"
                    ? "bg-emerald-600"
                    : status === "ARCHIVED"
                    ? "bg-forest-600"
                    : "bg-amber-600"
                }`}
              />
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-full border border-sand-300 bg-white px-5 py-2.5 text-xs font-semibold text-forest-800 transition hover:bg-sand-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest-900 disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving Product...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden />
                {product ? "Update Product" : "Publish Product"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (8 cols): Content, Media, Specifications */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card 1: Core Details */}
          <div className="card-surface p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2 border-b border-sand-200/80 pb-3">
              <Package className="h-5 w-5 text-forest-700" />
              <h2 className="font-serif text-lg font-semibold text-forest-950">Basic Information</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                Product Title *
              </label>
              <input
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. White Sesame Seeds (Natural 99.5% Purity)"
                className="input-admin mt-1.5 text-base font-medium"
              />
              <FieldError fieldErrors={state.fieldErrors} name="title" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                  Category *
                </label>
                <select
                  name="categoryId"
                  required
                  defaultValue={product?.categoryId ?? ""}
                  className="input-admin mt-1.5"
                >
                  <option value="">Choose Category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <FieldError fieldErrors={state.fieldErrors} name="categoryId" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                  Country of Origin
                </label>
                <input
                  name="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Myanmar (Burma)"
                  className="input-admin mt-1.5"
                />
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-forest-700/60">
                  <span>Quick pick:</span>
                  {["Myanmar", "Vietnam", "India", "Thailand"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setOrigin(opt)}
                      className="rounded bg-sand-200 px-1.5 py-0.5 hover:bg-forest-100 hover:text-forest-950"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                  Short Summary *
                </label>
                <span className="text-[11px] text-forest-700/60">Displayed on catalog listing cards</span>
              </div>
              <input
                name="summary"
                required
                defaultValue={product?.summary}
                placeholder="e.g. High oil content, machine cleaned, suitable for food processing and export."
                className="input-admin mt-1.5"
              />
              <FieldError fieldErrors={state.fieldErrors} name="summary" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                Detailed Commercial Description *
              </label>
              <textarea
                name="description"
                required
                rows={6}
                defaultValue={product?.description}
                placeholder="Provide complete product description: harvesting season, sorting processes, quality grading, moisture levels, export packaging options, and shipping terms..."
                className="input-admin mt-1.5 resize-y text-sm leading-relaxed"
              />
              <FieldError fieldErrors={state.fieldErrors} name="description" />
            </div>
          </div>

          {/* Card 2: Gallery & Media */}
          <div className="card-surface p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-sand-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Images className="h-5 w-5 text-forest-700" />
                <h2 className="font-serif text-lg font-semibold text-forest-950">Product Gallery</h2>
              </div>
              <span className="text-xs text-forest-700/60">Primary photo is marked with Cover badge</span>
            </div>

            <p className="text-xs text-forest-700/75">
              Upload high-resolution commodity photos. The first image will be used as the primary cover
              thumbnail. Drag and drop cards to reorder.
            </p>

            <ImageUploader
              name="images"
              label="Gallery images"
              multiple
              initial={product?.images ?? []}
            />
          </div>

          {/* Card 3: Specifications & Packaging */}
          <div className="card-surface p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-sand-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-forest-700" />
                <h2 className="font-serif text-lg font-semibold text-forest-950">
                  Specifications &amp; Export Standards
                </h2>
              </div>
              <span className="text-xs text-forest-700/60">Shown in the product detail table</span>
            </div>

            <p className="text-xs text-forest-700/75">
              Specify trade attributes like moisture, admixture, oil content, crop year, and bulk packaging.
            </p>

            <SpecsEditor initial={initialSpecsWithoutCurrency} />
          </div>
        </div>

        {/* Right Column (4 cols): Publishing, Commercial Terms, Trade Classification */}
        <div className="space-y-6 lg:col-span-4">
          {/* Rail Card 1: Status & Visibility */}
          <div className="card-surface p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-sand-200/80 pb-3">
              <Sparkles className="h-5 w-5 text-forest-700" />
              <h2 className="font-serif text-base font-semibold text-forest-950">Catalog Status</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                Publishing State *
              </label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                className="input-admin mt-1.5 font-semibold"
              >
                <option value="DRAFT">Draft (Hidden from public catalog)</option>
                <option value="PUBLISHED">Published (Active on website)</option>
                <option value="ARCHIVED">Archived (Delisted from catalog)</option>
              </select>
            </div>

            {/* Featured Product Toggle Card */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-sand-200 bg-sand-50/60 p-3.5 transition hover:bg-forest-50/50">
              <input
                type="checkbox"
                name="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-sand-300 accent-forest-700 focus:ring-forest-600"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Star className={`h-4 w-4 ${isFeatured ? "fill-gold-500 text-gold-500" : "text-forest-700/50"}`} />
                  <span className="text-xs font-bold text-forest-950">Feature on Homepage</span>
                </div>
                <p className="mt-0.5 text-[11px] text-forest-700/70 leading-normal">
                  Promote this commodity in the featured products showcase on the homepage.
                </p>
              </div>
            </label>
          </div>

          {/* Rail Card 2: Commercial Pricing & Currency */}
          <div className="card-surface p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-sand-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-forest-700" />
                <h2 className="font-serif text-base font-semibold text-forest-950">Pricing &amp; Terms</h2>
              </div>
              <span className="text-[11px] font-semibold text-forest-700/60 uppercase">Commercial</span>
            </div>

            {/* Live Pricing Preview Banner */}
            <div className="rounded-xl border border-gold-300 bg-gold-50/70 p-3.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-800">
                Buyer Catalog Display
              </p>
              <p className="font-serif text-lg font-bold text-forest-950 mt-0.5">
                {formattedPricePreview}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                  Currency / Unit
                </label>
                <input
                  name="currency"
                  list="currency-options"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="USD, MMK..."
                  className="input-admin mt-1.5 font-semibold uppercase"
                />
                <datalist id="currency-options">
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="MMK">MMK (Ks - Myanmar Kyat)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                  <option value="THB">THB (฿ - Thai Baht)</option>
                  <option value="CNY">CNY (¥ - Chinese Yuan)</option>
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                  Measurement Unit
                </label>
                <input
                  name="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="MT / Bag / Kg"
                  className="input-admin mt-1.5"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 text-[11px] text-forest-700/60">
              <span>Units:</span>
              {["MT", "Bag", "Kg", "Unit", "Ton"].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className="rounded bg-sand-200 px-1.5 py-0.5 hover:bg-forest-100 hover:text-forest-950"
                >
                  {u}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                Price Amount
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 720 (leave blank for inquiry)"
                className="input-admin mt-1.5 text-base font-semibold"
              />
              <FieldError fieldErrors={state.fieldErrors} name="price" />
              <p className="mt-1 text-[11px] text-forest-700/60">
                Leave blank if pricing is seasonal or requires custom B2B inquiry.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/80">
                Stock / Availability
              </label>
              <input
                name="availability"
                type="number"
                min="0"
                defaultValue={product?.availability ?? ""}
                placeholder="Blank = unlimited supply (0 = out of stock)"
                className="input-admin mt-1.5"
              />
              <p className="mt-1 text-[11px] text-forest-700/60">
                Quantity in units, or leave empty for continuous agricultural supply.
              </p>
            </div>
          </div>

          {/* Rail Card 3: Trade Classifications */}
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sand-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-forest-700" />
                <h2 className="font-serif text-base font-semibold text-forest-950">Trade Classification</h2>
              </div>
              <span className="text-xs text-forest-700/60">Badges</span>
            </div>

            <p className="text-xs text-forest-700/75">
              Select all modes that apply. These display as badges in search filters and product cards.
            </p>

            {tradeTypes.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {tradeTypes.map((t) => {
                  const isChecked = selectedTradeTypes.has(t.id);
                  return (
                    <label
                      key={t.id}
                      onClick={() => toggleTradeType(t.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                        isChecked
                          ? "border-forest-600 bg-forest-50/70 text-forest-950 font-semibold shadow-xs"
                          : "border-sand-200 bg-sand-50/30 text-forest-800 hover:bg-sand-50"
                      }`}
                    >
                      <span className="text-xs">{t.label}</span>
                      <input
                        type="checkbox"
                        name="tradeTypeIds"
                        value={t.id}
                        checked={isChecked}
                        onChange={() => {}} // Controlled by label click
                        className="h-4 w-4 rounded border-sand-300 text-forest-700 focus:ring-forest-600"
                      />
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-forest-700/60">
                No trade types created yet. You can add them under{" "}
                <Link href="/admin/trade-types" className="underline font-semibold text-forest-800">
                  Trade Types
                </Link>.
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
