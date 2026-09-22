import { Plus, Trash2 } from "lucide-react";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";

type Item = { id: string; position?: number };

type Props<T extends Item> = {
  title: string;
  description?: string;
  items: T[];
  renderItem: (item: T | null, position: number) => React.ReactNode;
  saveAction: (formData: FormData) => Promise<void> | void;
  deleteAction: (formData: FormData) => Promise<void> | void;
  addLabel?: string;
};

export function CollectionSection<T extends Item>({
  title,
  description,
  items,
  renderItem,
  saveAction,
  deleteAction,
  addLabel = "Add entry",
}: Props<T>) {
  return (
    <div className="mt-10">
      <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-forest-950">{title}</h3>
      {description ? <p className="mt-1 text-sm text-forest-700/70">{description}</p> : null}

      <div className="mt-4 grid gap-4">
        {items.map((item, index) => {
          const itemPosition = item.position ?? index;
          const deleteFormId = `delete-collection-${item.id}`;
          return (
            <div key={item.id} className="card-surface grid gap-4 p-5">
              <form action={saveAction} className="grid gap-4">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="position" value={String(itemPosition)} />
                <input type="hidden" name="isActive" value="on" />
                {renderItem(item, itemPosition)}

                <div className="flex items-center justify-between gap-3 border-t border-sand-200 pt-4">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-full bg-forest-100 px-5 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-700 hover:text-cream"
                  >
                    Save
                  </button>
                  <DangerSubmitButton
                    form={deleteFormId}
                    confirmText="Delete this entry permanently?"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-soil-100 px-3 text-sm font-semibold text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden /> Delete
                  </DangerSubmitButton>
                </div>
              </form>
              <form id={deleteFormId} action={deleteAction} hidden>
                <input type="hidden" name="id" value={item.id} />
              </form>
            </div>
          );
        })}

        <form action={saveAction} className="card-surface grid gap-4 border-2 border-dashed border-sand-300 p-5">
          <input type="hidden" name="position" value={String(items.length)} />
          {renderItem(null, items.length)}
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-semibold text-forest-950 transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" aria-hidden /> {addLabel}
          </button>
        </form>
      </div>
    </div>
  );
}