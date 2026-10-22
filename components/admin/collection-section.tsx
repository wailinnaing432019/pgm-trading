import { ListOrdered, Plus, Trash2, Sparkles } from "lucide-react";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { CollectionItemCard, AddEntryDrawer } from "@/components/admin/collection-client-wrappers";

type Item = { id: string; position?: number; title?: string; label?: string; name?: string };

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
  const anchorId = `collection-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div
      id={anchorId}
      data-section-key={anchorId}
      data-section-label={title}
      className="mt-12 scroll-mt-24"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-sand-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-100 text-forest-700">
              <ListOrdered className="h-4 w-4" aria-hidden />
            </span>
            <h3 className="font-serif text-xl font-semibold text-forest-950">{title}</h3>
            <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-semibold text-forest-800">
              {items.length} {items.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          {description ? <p className="mt-1 text-sm text-forest-700/70">{description}</p> : null}
        </div>

        {/* Add Entry Toggle and Drawer */}
        <AddEntryDrawer addLabel={addLabel}>
          <form action={saveAction} className="grid gap-4">
            <input type="hidden" name="position" value={String(items.length)} />
            {renderItem(null, items.length)}

            <div className="mt-2 flex items-center justify-end gap-3 border-t border-sand-200/80 pt-4">
              <SubmitButton
                variant="gold"
                pendingText="Adding entry…"
              >
                <Plus className="h-4 w-4 shrink-0" aria-hidden />
                <span>{addLabel}</span>
              </SubmitButton>
            </div>
          </form>
        </AddEntryDrawer>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="card-surface mt-6 flex flex-col items-center justify-center border-2 border-dashed border-sand-300 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100 text-forest-700">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <h4 className="mt-3 font-serif text-base font-semibold text-forest-950">No entries added yet</h4>
          <p className="mt-1 max-w-sm text-xs text-forest-700/70">
            This collection currently has no items configured. Use the button above to add your first item.
          </p>
        </div>
      ) : null}

      {/* Existing Items List */}
      <div className="mt-6 grid gap-4">
        {items.map((item, index) => {
          const itemPosition = item.position ?? index;
          const deleteFormId = `delete-collection-${item.id}`;
          const itemTitle = item.title || item.label || item.name || `Entry #${index + 1}`;

          return (
            <CollectionItemCard
              key={item.id}
              index={index}
              itemId={String(item.id)}
              itemTitle={itemTitle}
            >
              <form action={saveAction} className="grid gap-4">
                <div className="border-b border-sand-200/60 pb-2">
                  <span className="text-xs font-semibold text-forest-700/70">Fields</span>
                </div>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="position" value={String(itemPosition)} />
                <input type="hidden" name="isActive" value="on" />
                {renderItem(item, itemPosition)}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200/80 pt-4">
                  <SubmitButton
                    variant="primary"
                    size="sm"
                    pendingText="Saving…"
                  >
                    Save Entry
                  </SubmitButton>

                  <DangerSubmitButton
                    form={deleteFormId}
                    confirmText={`Are you sure you want to delete "${itemTitle}" permanently?`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-soil-100 px-3.5 text-xs font-semibold text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                  </DangerSubmitButton>
                </div>
              </form>

              <form id={deleteFormId} action={deleteAction} hidden>
                <input type="hidden" name="id" value={item.id} />
              </form>
            </CollectionItemCard>
          );
        })}
      </div>
    </div>
  );
}