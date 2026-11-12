import { ProductForm } from "@/components/admin/product-form";
import { getCategories, getAdminTradeTypes } from "@/lib/queries";

export default async function NewProductPage() {
  const [categories, tradeTypes] = await Promise.all([getCategories(), getAdminTradeTypes()]);

  return (
    <div className="mx-auto max-w-6xl">
      <ProductForm
        categories={categories}
        tradeTypes={tradeTypes.map((t) => ({ id: t.id, label: t.label }))}
      />
    </div>
  );
}
