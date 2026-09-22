import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/queries";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to products
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-forest-950">Add product</h1>
      <p className="mt-1 text-sm text-forest-700/70">Fill in the details — the catalog updates instantly.</p>

      <div className="card-surface mt-6 p-7">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}