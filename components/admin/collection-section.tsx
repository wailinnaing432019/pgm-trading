import { ListOrdered, Plus, Sparkles, Trash2 } from "lucide-react";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  AddEntryDrawer,
  CollectionForm,
  CollectionItemCard,
} from "@/components/admin/collection-client-wrappers";
import type { AdminActionState } from "@/lib/actions/admin";
import type { CollectionKind } from "@/lib/section-defaults";
import { getLucideIcon } from "@/lib/icons";

type Item = {
  id: string;
  position?: number;
  title?: string;
  label?: string;
  name?: string;
  icon?: string | null;
  description?: string | null;
  value?: number;
  suffix?: string | null;
  year?: number;
  address?: string | null;
  phone?: string | null;
};

type Props<T extends Item> = {
  title: string;
  description?: string;
  items: T[];
  collectionKind?: CollectionKind;
  renderItem: (item: T | null, position: number) => React.ReactNode;
  saveAction: (
    prev: AdminActionState | null,
    formData: FormData
  ) => Promise<AdminActionState>;
  deleteAction: (formData: FormData) => Promise<void> | void;
  addLabel?: string;
};

function buildItemPreview(item: Item, index: number, kind?: CollectionKind) {
  let badge: string | undefined;
  let subtitle: string | undefined;

  if (typeof item.value === "number") {
    badge = `${item.value.toLocaleString()}${item.suffix ?? ""}`;
  } else if (typeof item.year === "number") {
    badge = String(item.year);
  } else if (kind === "office" && index === 0) {
    badge = "Head Office";
  }

  if (item.description?.trim()) {
    subtitle = item.description.trim();
  } else if (item.address?.trim()) {
    subtitle = item.phone?.trim()
      ? `${item.address.trim()} · ${item.phone.trim()}`
      : item.address.trim();
  }

  return { badge, subtitle };
}

export function CollectionSection<T extends Item>({
  title,
  description,
  items,
  collectionKind,
  renderItem,
  saveAction,
  deleteAction,
  addLabel = "Add entry",
}: Props<T>) {
  const anchorId = `collection-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const nextPosition = items.reduce((max, item) => Math.max(max, (item.position ?? 0) + 1), items.length);

  return (
    <div
      id={anchorId}
      data-section-key={anchorId}
      data-section-label={title}
      className="card-surface scroll-mt-24 border border-sand-200/80 p-5 sm:p-6"
    >
      {/* Section Header + Full-Width Add Drawer */}
      <AddEntryDrawer
        addLabel={addLabel}
        header={
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                <ListOrdered className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="font-serif text-lg font-semibold text-forest-950 sm:text-xl">
                {title}
              </h3>
              <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-semibold text-forest-800">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            {description ? (
              <p className="mt-1.5 text-xs leading-relaxed text-forest-700/75 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        }
      >
        <CollectionForm action={saveAction} mode="create">
          <input type="hidden" name="position" value={String(nextPosition)} />
          {renderItem(null, nextPosition)}

          <div className="mt-2 flex items-center justify-end gap-3 border-t border-sand-200/80 pt-4">
            <SubmitButton variant="gold" pendingText="Adding…">
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              <span>{addLabel}</span>
            </SubmitButton>
          </div>
        </CollectionForm>
      </AddEntryDrawer>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50/50 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <h4 className="mt-3 font-serif text-base font-semibold text-forest-950">
            No items added yet
          </h4>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-forest-700/70">
            This list is currently empty on the website. Click{" "}
            <strong className="font-semibold text-forest-900">“{addLabel}”</strong> above to add
            your first item.
          </p>
        </div>
      ) : null}

      {/* Existing Items List */}
      {items.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {items.map((item, index) => {
            const itemPosition = item.position ?? index;
            const deleteFormId = `delete-collection-${item.id}`;
            const itemTitle = item.title || item.label || item.name || `Item #${index + 1}`;
            const { badge, subtitle } = buildItemPreview(item, index, collectionKind);
            const IconComponent = item.icon ? getLucideIcon(item.icon) : null;

            return (
              <CollectionItemCard
                key={item.id}
                index={index}
                total={items.length}
                itemId={String(item.id)}
                itemTitle={itemTitle}
                itemSubtitle={subtitle}
                itemBadge={badge}
                icon={
                  IconComponent ? <IconComponent className="h-4 w-4" aria-hidden /> : undefined
                }
                collectionKind={collectionKind}
              >
                <CollectionForm action={saveAction} mode="edit">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="position" value={String(itemPosition)} />
                  <input type="hidden" name="isActive" value="on" />
                  {renderItem(item, itemPosition)}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200/80 pt-4">
                    <SubmitButton variant="primary" size="sm" pendingText="Saving…">
                      Save changes
                    </SubmitButton>

                    <DangerSubmitButton
                      form={deleteFormId}
                      confirmText={`Are you sure you want to delete "${itemTitle}" permanently?`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-soil-100 px-3.5 text-xs font-semibold text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                    </DangerSubmitButton>
                  </div>
                </CollectionForm>

                <form id={deleteFormId} action={deleteAction} hidden>
                  <input type="hidden" name="id" value={item.id} />
                </form>
              </CollectionItemCard>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
