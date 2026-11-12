"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  ListTree,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PageOutlineItem = {
  /** DOM id of the section, e.g. "section-hero" or "collection-core-values". */
  id: string;
  label: string;
  /** Section has saved content. */
  configured?: boolean;
  /** Collection item count. */
  count?: number;
};

type OutlineStatusFilter = "all" | "pending" | "done";

type PageEditorContextValue = {
  openKey: string | null;
  activeId: string | null;
  filter: string;
  setFilter: (value: string) => void;
  toggleSection: (key: string, id: string) => void;
  toggleItem: (id: string) => void;
  focus: (id: string) => void;
};

const PageEditorContext = createContext<PageEditorContextValue | null>(null);

export function usePageEditor() {
  return useContext(PageEditorContext);
}

function keyFromId(id: string) {
  return id.startsWith("section-") ? id.slice("section-".length) : null;
}

function itemIsDone(item: PageOutlineItem) {
  if (item.configured) return true;
  return (item.count ?? 0) > 0;
}

const GUIDE_STORAGE_KEY = "pgm_hide_page_editor_guide";
const GUIDE_CHANGE_EVENT = "pgm-guide-visibility-change";

function subscribeGuideStore(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(GUIDE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(GUIDE_CHANGE_EVENT, callback);
  };
}

function getGuideHiddenSnapshot() {
  try {
    return window.localStorage.getItem(GUIDE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function PageEditor({
  items,
  children,
}: {
  items: PageOutlineItem[];
  children: React.ReactNode;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<OutlineStatusFilter>("all");
  const hideGuide = useSyncExternalStore(
    subscribeGuideStore,
    getGuideHiddenSnapshot,
    () => false
  );
  const showGuide = !hideGuide;
  const initialised = useRef(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const toggleGuide = useCallback((visible: boolean) => {
    try {
      window.localStorage.setItem(GUIDE_STORAGE_KEY, visible ? "0" : "1");
      window.dispatchEvent(new Event(GUIDE_CHANGE_EVENT));
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const syncUrl = useCallback((id: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("section", id);
    else url.searchParams.delete("section");
    window.history.replaceState(null, "", url.toString());
  }, []);

  const focus = useCallback(
    (id: string, options?: { scroll?: boolean; updateUrl?: boolean }) => {
      const key = keyFromId(id);
      setOpenKey(key);
      setActiveId(id);

      if (options?.updateUrl !== false) syncUrl(id);

      if (options?.scroll !== false) {
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    },
    [syncUrl]
  );

  const toggleSection = useCallback(
    (key: string, id: string) => {
      const closing = openKey === key;
      setOpenKey(closing ? null : key);
      setActiveId(closing ? null : id);
      syncUrl(closing ? null : id);
    },
    [openKey, syncUrl]
  );

  // Collection items share the page's single-open accordion state, so opening
  // one closes any open section and vice versa.
  const toggleItem = useCallback(
    (id: string) => {
      const key = `item-${id}`;
      setOpenKey((current) => (current === key ? null : key));
      setActiveId(null);
      syncUrl(null);
    },
    [syncUrl]
  );

  // Open the section requested in the URL (?section=section-hero) once on mount.
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const target = new URLSearchParams(window.location.search).get("section");
    if (!target || !items.some((item) => item.id === target)) return;

    const timer = window.setTimeout(() => {
      setOpenKey(keyFromId(target));
      setActiveId(target);
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<PageEditorContextValue>(
    () => ({ openKey, activeId, filter, setFilter, toggleSection, toggleItem, focus }),
    [openKey, activeId, filter, toggleSection, toggleItem, focus]
  );

  const nextPendingItem = items.find((item) => !itemIsDone(item));
  const doneCount = items.filter(itemIsDone).length;
  const allCustomized = items.length > 0 && doneCount === items.length;

  const outlineProps = {
    items,
    activeId,
    filter,
    statusFilter,
    onStatusFilter: setStatusFilter,
    onFilter: setFilter,
  };

  return (
    <PageEditorContext.Provider value={value}>
      <div className="mx-auto max-w-6xl">
        <div className="xl:grid xl:grid-cols-[268px_minmax(0,1fr)] xl:items-start xl:gap-8">
          {/* Desktop outline */}
          <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-sand-200/80 bg-white p-4 shadow-sm xl:block">
            <OutlineList
              {...outlineProps}
              onSelect={focus}
              onNextPending={nextPendingItem ? () => focus(nextPendingItem.id) : undefined}
            />
          </aside>

          {/* Mobile / tablet outline */}
          <details
            ref={detailsRef}
            className="mb-6 rounded-2xl border border-sand-200/80 bg-white shadow-sm xl:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-forest-950 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <ListTree className="h-4 w-4 text-forest-600" aria-hidden />
                Jump to a section
                <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium tabular-nums text-forest-700">
                  {doneCount}/{items.length}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-forest-700/60" aria-hidden />
            </summary>
            <div className="border-t border-sand-200/80 p-3">
              <OutlineList
                {...outlineProps}
                onSelect={(id) => {
                  detailsRef.current?.removeAttribute("open");
                  focus(id);
                }}
                onNextPending={
                  nextPendingItem
                    ? () => {
                        detailsRef.current?.removeAttribute("open");
                        focus(nextPendingItem.id);
                      }
                    : undefined
                }
              />
            </div>
          </details>

          <div className="min-w-0 space-y-8">
            {/* Friendly Welcome / How-To Guide for Normal Users */}
            {showGuide ? (
              <div className="rounded-2xl border border-gold-300/70 bg-gradient-to-br from-cream via-sand-50 to-gold-100/40 p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-400/30 text-forest-950">
                      <BookOpen className="h-4 w-4 text-gold-700" aria-hidden />
                    </span>
                    <div>
                      <h2 className="font-serif text-base font-semibold text-forest-950">
                        Quick Guide: Editing Website Content
                      </h2>
                      <p className="mt-0.5 text-xs text-forest-800/75 sm:text-sm">
                        Customize wording, photos, and lists below — no coding needed.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleGuide(false)}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-forest-700/70 transition-colors hover:bg-white hover:text-forest-950"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden /> Hide guide
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-sand-200/80 bg-white/85 px-3.5 py-3">
                    <p className="text-xs font-semibold text-forest-950">1. Click a block below</p>
                    <p className="mt-0.5 text-xs text-forest-700/75">
                      Each card controls one visible part of the public page.
                    </p>
                  </div>
                  <div className="rounded-xl border border-sand-200/80 bg-white/85 px-3.5 py-3">
                    <p className="text-xs font-semibold text-forest-950">2. Check the preview</p>
                    <p className="mt-0.5 text-xs text-forest-700/75">
                      Watch your text and photos update live before you save.
                    </p>
                  </div>
                  <div className="rounded-xl border border-sand-200/80 bg-white/85 px-3.5 py-3">
                    <p className="text-xs font-semibold text-forest-950">3. Safe defaults</p>
                    <p className="mt-0.5 text-xs text-forest-700/75">
                      Leave any section unedited to keep built-in website copy.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200/70 pt-3">
                  <p className="text-xs font-medium text-forest-800">
                    {allCustomized ? (
                      <span className="inline-flex items-center gap-1.5 text-forest-700">
                        <CheckCircle2 className="h-4 w-4 text-forest-600" aria-hidden />
                        Every section on this page has been customized!
                      </span>
                    ) : (
                      <span>
                        <strong className="font-semibold text-forest-950">
                          {items.length - doneCount}
                        </strong>{" "}
                        {items.length - doneCount === 1 ? "section still uses" : "sections still use"}{" "}
                        built-in defaults.
                      </span>
                    )}
                  </p>

                  {nextPendingItem ? (
                    <button
                      type="button"
                      onClick={() => focus(nextPendingItem.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-forest-700 px-3.5 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-forest-800"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-gold-300" aria-hidden />
                      <span>Set up “{nextPendingItem.label}”</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleGuide(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3 py-1 text-xs font-medium text-forest-700 transition-colors hover:bg-forest-50 hover:text-forest-950"
                >
                  <BookOpen className="h-3.5 w-3.5 text-gold-600" aria-hidden />
                  Show editing guide
                </button>
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </PageEditorContext.Provider>
  );
}

function OutlineList({
  items,
  activeId,
  filter,
  statusFilter,
  onStatusFilter,
  onFilter,
  onSelect,
  onNextPending,
}: {
  items: PageOutlineItem[];
  activeId: string | null;
  filter: string;
  statusFilter: OutlineStatusFilter;
  onStatusFilter: (value: OutlineStatusFilter) => void;
  onFilter: (value: string) => void;
  onSelect: (id: string) => void;
  onNextPending?: () => void;
}) {
  const term = filter.trim().toLowerCase();
  const visible = items.filter((item) => {
    if (term && !item.label.toLowerCase().includes(term)) return false;
    const done = itemIsDone(item);
    if (statusFilter === "done" && !done) return false;
    if (statusFilter === "pending" && done) return false;
    return true;
  });

  const done = items.filter(itemIsDone).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="space-y-3.5">
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-forest-700/65">
          <span>Page Outline</span>
          <span className="tabular-nums text-forest-800">{pct}% ready</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200" role="presentation">
          <div
            className="h-full rounded-full bg-forest-600 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-forest-700/65">
          {done} of {items.length} blocks customized
        </p>
      </div>

      {/* Filter chips */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-sand-100/80 p-1">
        {(
          [
            { key: "all", label: "All" },
            { key: "pending", label: "Default" },
            { key: "done", label: "Edited" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusFilter(tab.key)}
            className={cn(
              "rounded-lg py-1 text-[11px] font-semibold transition-colors",
              statusFilter === tab.key
                ? "bg-white text-forest-950 shadow-xs"
                : "text-forest-700/70 hover:text-forest-950"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-forest-700/40"
          aria-hidden
        />
        <input
          value={filter}
          onChange={(event) => onFilter(event.target.value)}
          placeholder="Search sections…"
          aria-label="Filter sections"
          className="h-8 w-full rounded-lg border border-sand-200 bg-sand-50/60 pl-8 pr-7 text-xs text-forest-950 placeholder:text-forest-700/40 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-500"
        />
        {filter ? (
          <button
            type="button"
            onClick={() => onFilter("")}
            aria-label="Clear section filter"
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-forest-700/50 hover:bg-sand-100 hover:text-forest-900"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        ) : null}
      </div>

      <ol className="space-y-0.5">
        {visible.map((item) => {
          const doneItem = itemIsDone(item);
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors",
                  active
                    ? "bg-forest-700 text-cream shadow-xs"
                    : "text-forest-800 hover:bg-forest-50 hover:text-forest-950"
                )}
              >
                {doneItem ? (
                  <CheckCircle2
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      active ? "text-gold-300" : "text-forest-600"
                    )}
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      active ? "text-cream/50" : "text-forest-700/30"
                    )}
                    aria-hidden
                  />
                )}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {typeof item.count === "number" ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                      active ? "bg-cream/20 text-cream" : "bg-sand-100 text-forest-700"
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      {visible.length === 0 ? (
        <p className="px-2 py-3 text-center text-xs text-forest-700/60">
          {term ? `No sections match “${filter}”.` : "No sections in this filter."}
        </p>
      ) : null}

      {onNextPending ? (
        <button
          type="button"
          onClick={onNextPending}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-sand-200 bg-sand-50/70 px-3 py-2 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-300 hover:bg-forest-50"
        >
          <Sparkles className="h-3.5 w-3.5 text-gold-600" aria-hidden />
          Jump to next default block
        </button>
      ) : null}
    </div>
  );
}
