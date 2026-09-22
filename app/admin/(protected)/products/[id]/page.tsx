import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    getCategories(),
    prisma.product.findUnique({ where: { id } }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to products
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-forest-950">Edit product</h1>
      <p className="mt-1 text-sm text-forest-700/70">{product.title}</p>

      <div className="card-surface mt-6 p-7">
        <ProductForm categories={categories} product={{ ...product, price: product.price ? Number(product.price) : null }} />
      </div>
    </div>
  );
}