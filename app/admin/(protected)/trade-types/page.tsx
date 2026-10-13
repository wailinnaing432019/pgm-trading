import { Tags, Trash2 } from "lucide-react";
import { getAdminTradeTypes } from "@/lib/queries";
import { submitTradeType, deleteTradeType } from "@/lib/actions/admin";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";

type TradeTypeAdmin = {
  id: string;
  label: string;
  description: string | null;
  position: number;
  isActive: boolean;
  _count: { products: number };
};

async function TradeTypeEditor({
  tradeType,
  position,
  isNew = false,
}: {
  tradeType?: TradeTypeAdmin;
  position: number;
  isNew?: boolean;
}) {
  const deleteFormId = tradeType ? `delete-trade-type-${tradeType.id}` : "";
  const productCount = tradeType?._count.products ?? 0;

  return (
    <div className={`card-surface grid gap-4 p-5 ${isNew ? "border-2 border-dashed border-sand-300" : ""}`}>
      <form action={submitTradeType} className="grid gap-4">
        {tradeType ? <input type="hidden" name="id" value={tradeType.id} /> : null}
        <input type="hidden" name="position" value={String(position)} />

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Label *</label>
            <input name="label" required defaultValue={tradeType?.label ?? ""} placeholder="e.g. Rentable" className="input-admin" />
            <p className="mt-1 text-xs text-forest-700/60">Shown as a badge on product cards, e.g. “Export”, “Rentable”.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Description</label>
            <input name="description" defaultValue={tradeType?.description ?? ""} placeholder="Optional note for editors" className="input-admin" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 pt-4">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full bg-forest-100 px-5 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-700 hover:text-cream"
            >
              Save
            </button>
            <label className="flex items-center gap-2">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={tradeType ? tradeType.isActive : true}
                className="h-4 w-4 rounded border-sand-300 accent-forest-700"
              />
              <span className="text-sm font-medium text-forest-900">Active</span>
            </label>
          </div>

          {isNew ? null : productCount > 0 ? (
            <span className="text-sm text-forest-700/60">
              Assigned to {productCount} product{productCount === 1 ? "" : "s"} — unassign before deleting.
            </span>
          ) : (
            <DangerSubmitButton
              form={deleteFormId}
              confirmText="Delete this trade type permanently?"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-soil-100 px-3 text-sm font-semibold text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </DangerSubmitButton>
          )}
        </div>
      </form>

      {!isNew && tradeType ? (
        <form id={deleteFormId} action={deleteTradeType} hidden>
          <input type="hidden" name="id" value={tradeType.id} />
        </form>
      ) : null}
    </div>
  );
}

export default async function AdminTradeTypesPage() {
  const tradeTypes = await getAdminTradeTypes();

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-950">Trade Types</h1>
          <p className="mt-1 text-sm text-forest-700/70">
            Listing modes shown as badges on products — export, import, rentable, or anything else.
          </p>
        </div>
        <span className="flex items-center gap-2 text-sm font-medium text-forest-700">
          <Tags className="h-4 w-4" aria-hidden /> {tradeTypes.length} types
        </span>
      </div>

      <div className="mt-8 grid gap-5">
        {tradeTypes.map((tradeType, index) => (
          <TradeTypeEditor key={tradeType.id} tradeType={tradeType} position={index} />
        ))}

        <TradeTypeEditor position={tradeTypes.length} isNew />
      </div>
    </div>
  );
}