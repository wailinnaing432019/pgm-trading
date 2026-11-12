import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategories, getAdminTradeTypes } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, tradeTypes, product] = await Promise.all([
    getCategories(),
    getAdminTradeTypes(),
    prisma.product.findUnique({
      where: { id },
      include: { tradeTypes: { select: { tradeTypeId: true } } },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <ProductForm
        categories={categories}
        tradeTypes={tradeTypes.map((t) => ({ id: t.id, label: t.label }))}
        product={{ ...product, price: product.price ? Number(product.price) : null }}
      />
    </div>
  );
}
