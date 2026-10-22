"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, ChevronDown, Circle, ListTree, Search, X } from "lucide-react";
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
  const initialised = useRef(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

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

  const outlineProps = {
    items,
    activeId,
    filter,
    onFilter: setFilter,
  };

  return (
    <PageEditorContext.Provider value={value}>
      <div className="mx-auto max-w-6xl">
        <div className="xl:grid xl:grid-cols-[248px_minmax(0,1fr)] xl:items-start xl:gap-8">
          {/* Desktop outline */}
          <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-sand-200/80 bg-white p-3 shadow-sm xl:block">
            <OutlineList {...outlineProps} onSelect={focus} />
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
              />
            </div>
          </details>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </PageEditorContext.Provider>
  );
}

function OutlineList({
  items,
  activeId,
  filter,
  onFilter,
  onSelect,
}: {
  items: PageOutlineItem[];
  activeId: string | null;
  filter: string;
  onFilter: (value: string) => void;
  onSelect: (id: string) => void;
}) {
  const term = filter.trim().toLowerCase();
  const visible = term
    ? items.filter((item) => item.label.toLowerCase().includes(term))
    : items;
  const done = items.filter(itemIsDone).length;

  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-forest-700/60">
          <span>Page structure</span>
          <span className="tabular-nums text-forest-700/50">
            {done}/{items.length}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand-200" role="presentation">
          <div
            className="h-full rounded-full bg-forest-600 transition-all duration-300"
            style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-forest-700/50">
          {done} of {items.length} blocks customized
        </p>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-forest-700/40"
          aria-hidden
        />
        <input
          value={filter}
          onChange={(event) => onFilter(event.target.value)}
          placeholder="Find a section…"
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
          const done = itemIsDone(item);
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  active
                    ? "bg-forest-700 text-cream"
                    : "text-forest-800 hover:bg-forest-50 hover:text-forest-950"
                )}
              >
                {done ? (
                  <CheckCircle2
                    className={cn("h-3.5 w-3.5 shrink-0", active ? "text-gold-300" : "text-forest-600")}
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className={cn("h-3.5 w-3.5 shrink-0", active ? "text-cream/50" : "text-forest-700/30")}
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
        <p className="px-2 py-3 text-xs text-forest-700/60">
          No sections match “{filter}”.
        </p>
      ) : null}
    </div>
  );
}
