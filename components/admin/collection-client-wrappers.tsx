"use client";

import {
  createContext,
  useActionState,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { moveCollectionItem, type AdminActionState } from "@/lib/actions/admin";
import type { CollectionKind } from "@/lib/section-defaults";
import { usePageEditor } from "@/components/admin/page-editor";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

const AddDrawerCloseContext = createContext<(() => void) | null>(null);

export function useAddDrawerClose() {
  return useContext(AddDrawerCloseContext);
}

interface CollectionItemCardProps {
  index: number;
  total: number;
  itemId: string;
  itemTitle: string;
  itemSubtitle?: string;
  itemBadge?: string;
  icon?: React.ReactNode;
  collectionKind?: CollectionKind;
  children: React.ReactNode;
}

export function CollectionItemCard({
  index,
  total,
  itemId,
  itemTitle,
  itemSubtitle,
  itemBadge,
  icon,
  collectionKind,
  children,
}: CollectionItemCardProps) {
  const editor = usePageEditor();
  const [localExpanded, setLocalExpanded] = useState(false);
  const [isMoving, startMoveTransition] = useTransition();

  const panelId = `collection-item-${itemId}`;
  const isExpanded = editor ? editor.openKey === `item-${itemId}` : localExpanded;
  const toggle = () => {
    if (editor) editor.toggleItem(itemId);
    else setLocalExpanded((value) => !value);
  };

  const canReorder = Boolean(collectionKind) && total > 1;
  const canMoveUp = canReorder && index > 0;
  const canMoveDown = canReorder && index < total - 1;

  const handleMove = (direction: "up" | "down") => {
    if (!collectionKind || isMoving) return;
    startMoveTransition(async () => {
      await moveCollectionItem(collectionKind, itemId, direction);
    });
  };

  return (
    <div
      className={cn(
        "card-surface scroll-mt-24 border transition-all duration-200",
        isExpanded
          ? "border-forest-500/40 shadow-lift ring-2 ring-forest-600/10"
          : "border-sand-200/80 hover:border-forest-300 hover:shadow-md"
      )}
    >
      {/* Header Row: toggle button is a sibling of reorder controls (never nested buttons) */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 transition-colors",
          isExpanded
            ? "rounded-t-2xl bg-forest-50/40"
            : "rounded-2xl bg-white hover:bg-sand-50/60"
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 cursor-pointer select-none items-center gap-3 p-4 text-left"
        >
          {canReorder ? (
            <GripVertical
              className="hidden h-4 w-4 shrink-0 text-forest-700/30 sm:block"
              aria-hidden
            />
          ) : null}

          {icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
              {icon}
            </span>
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-100 font-mono text-xs font-semibold text-forest-800">
              #{index + 1}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {icon ? (
                <span className="rounded-full bg-sand-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-forest-700">
                  #{index + 1}
                </span>
              ) : null}
              <span className="truncate font-serif text-base font-semibold text-forest-950">
                {itemTitle}
              </span>
              {itemBadge ? (
                <span className="inline-flex shrink-0 items-center rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-forest-950">
                  {itemBadge}
                </span>
              ) : null}
            </div>
            {!isExpanded && itemSubtitle ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-forest-700/70">{itemSubtitle}</p>
            ) : null}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1.5 pr-3 sm:pr-4">
          {canReorder ? (
            <div className="flex items-center gap-0.5 rounded-full border border-sand-200 bg-sand-50/80 p-0.5">
              <button
                type="button"
                disabled={!canMoveUp || isMoving}
                onClick={() => handleMove("up")}
                aria-label={`Move ${itemTitle} up`}
                title="Move earlier in list"
                className="flex h-7 w-7 items-center justify-center rounded-full text-forest-800 transition-colors hover:bg-white hover:text-forest-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isMoving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                )}
              </button>
              <button
                type="button"
                disabled={!canMoveDown || isMoving}
                onClick={() => handleMove("down")}
                aria-label={`Move ${itemTitle} down`}
                title="Move later in list"
                className="flex h-7 w-7 items-center justify-center rounded-full text-forest-800 transition-colors hover:bg-white hover:text-forest-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={toggle}
            aria-label={isExpanded ? `Collapse ${itemTitle}` : `Edit ${itemTitle}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              isExpanded
                ? "bg-forest-700 text-cream"
                : "border border-sand-200 bg-white text-forest-800 hover:bg-forest-50"
            )}
          >
            {!isExpanded ? <Pencil className="h-3 w-3" aria-hidden /> : null}
            <span className="hidden sm:inline">{isExpanded ? "Editing" : "Edit"}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div id={panelId} className="border-t border-sand-200/80 p-5">
          {children}
        </div>
      )}
    </div>
  );
}

interface AddEntryDrawerProps {
  addLabel: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function AddEntryDrawer({ addLabel, header, children }: AddEntryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleButton = (
    <button
      type="button"
      onClick={() => setIsOpen((prev) => !prev)}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all",
        isOpen
          ? "bg-sand-200 text-forest-900 hover:bg-sand-300"
          : "bg-gold-500 text-forest-950 hover:bg-gold-400"
      )}
    >
      {isOpen ? (
        <>
          <X className="h-3.5 w-3.5" aria-hidden /> Close Form
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel}
        </>
      )}
    </button>
  );

  return (
    <AddDrawerCloseContext.Provider value={() => setIsOpen(false)}>
      <div>
        {header ? (
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-sand-200/80 pb-4">
            {header}
            {toggleButton}
          </div>
        ) : (
          <div className="flex justify-end">{toggleButton}</div>
        )}

        {isOpen && (
          <div className="card-surface mt-5 border-2 border-dashed border-gold-400/70 bg-sand-50/60 p-6 shadow-md animate-fade-up">
            <div className="mb-4 flex items-center justify-between border-b border-sand-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-forest-950">
                  +
                </span>
                <h4 className="font-serif text-base font-semibold text-forest-950">
                  Create new {addLabel.replace(/^add\s+/i, "")}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-forest-700/70 hover:text-forest-950"
              >
                Cancel
              </button>
            </div>

            {children}
          </div>
        )}
      </div>
    </AddDrawerCloseContext.Provider>
  );
}

const initialState: AdminActionState = { ok: false };

function firstValidationError(state: AdminActionState): string | null {
  if (state.error) return state.error;
  if (!state.fieldErrors) return null;
  for (const [field, messages] of Object.entries(state.fieldErrors)) {
    const msg = messages?.[0];
    if (msg) return `${field}: ${msg}`;
  }
  return null;
}

export function CollectionForm({
  action,
  mode,
  className,
  children,
}: {
  action: (prev: AdminActionState | null, formData: FormData) => Promise<AdminActionState>;
  mode: "create" | "edit";
  className?: string;
  children: React.ReactNode;
}) {
  const closeDrawer = useAddDrawerClose();
  const { pushToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const [state, formAction] = useActionState<AdminActionState, FormData>(
    async (prev, formData) => {
      const result = await action(prev, formData);
      if (result.ok) {
        if (mode === "create") {
          formRef.current?.reset();
          closeDrawer?.();
        } else {
          setSavedNotice(true);
        }
      } else {
        const err = firstValidationError(result);
        if (err) pushToast("error", err);
      }
      return result;
    },
    initialState
  );

  useEffect(() => {
    if (!savedNotice) return;
    const timer = window.setTimeout(() => setSavedNotice(false), 3000);
    return () => window.clearTimeout(timer);
  }, [savedNotice]);

  const errorBanner = !state.ok ? firstValidationError(state) : null;

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn("grid gap-4", className)}
    >
      {errorBanner ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-soil-300 bg-soil-50 px-3.5 py-2.5 text-xs font-medium text-soil-900"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-soil-700" aria-hidden />
          <span>Please check your fields — {errorBanner}</span>
        </div>
      ) : null}

      {savedNotice ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2 text-xs font-semibold text-forest-800"
        >
          <Check className="h-4 w-4 text-forest-600" aria-hidden />
          Changes saved!
        </div>
      ) : null}

      {children}
    </form>
  );
}
