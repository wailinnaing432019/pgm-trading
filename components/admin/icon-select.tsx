"use client";

import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { getLucideIcon, iconKeys } from "@/lib/icons";
import { cn } from "@/lib/utils";

type IconSelectProps = {
  value?: string | null;
  label?: string;
  /** Form field name. Omit when using the component in controlled mode. */
  name?: string;
  /** Controlled mode: called with the picked icon key. */
  onChange?: (key: string) => void;
  /** Compact trigger for tight card headers. */
  compact?: boolean;
};

/** Turn "HeartHandshake" into "Heart Handshake" so names are readable. */
function iconLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2");
}

/**
 * Visual icon picker: shows the actual icon artwork for every option instead
 * of asking admins to guess from names in a plain select box.
 */
export function IconSelect({
  value,
  label = "Icon",
  name,
  onChange,
  compact = false,
}: IconSelectProps) {
  const controlled = typeof onChange === "function";
  const [internal, setInternal] = useState(value || "Globe2");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const current = controlled ? value || "Globe2" : internal;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return iconKeys;
    return iconKeys.filter(
      (key) =>
        key.toLowerCase().includes(term) ||
        iconLabel(key).toLowerCase().includes(term)
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const select = (key: string) => {
    setInternal(key);
    onChange?.(key);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className={cn("relative", compact ? "min-w-0" : "w-full")}>
      {!compact ? (
        <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setQuery("");
        }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${label}: ${iconLabel(current)}. Choose an icon`}
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg border border-sand-200 bg-white text-left transition-colors hover:border-forest-300 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500",
          compact ? "h-8 w-auto px-2 text-xs" : "h-11 w-full px-3 text-sm"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md bg-forest-100 text-forest-800",
              compact ? "h-6 w-6" : "h-7 w-7"
            )}
          >
            {createElement(getLucideIcon(current), {
              className: compact ? "h-3.5 w-3.5" : "h-4 w-4",
              "aria-hidden": true,
            })}
          </span>
          <span className="truncate font-medium text-forest-900">{iconLabel(current)}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-forest-700/60 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {name ? <input type="hidden" name={name} value={current} /> : null}

      {open ? (
        <div className="absolute left-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-sand-200 bg-white p-3 shadow-xl">
          <div className="relative mb-2">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-forest-700/40"
              aria-hidden
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search icons…"
              aria-label="Search icons"
              className="h-8 w-full rounded-lg border border-sand-200 bg-sand-50/60 pl-8 pr-2 text-xs text-forest-950 placeholder:text-forest-700/40 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-500"
            />
          </div>

          <div className="grid max-h-64 grid-cols-4 gap-1.5 overflow-y-auto pr-0.5">
            {filtered.map((key) => {
              const Icon = getLucideIcon(key);
              const active = key === current;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => select(key)}
                  aria-pressed={active}
                  title={iconLabel(key)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-colors",
                    active
                      ? "border-forest-600 bg-forest-50 text-forest-950"
                      : "border-transparent text-forest-800 hover:border-sand-200 hover:bg-sand-50"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span className="line-clamp-2 w-full break-words text-center text-[9px] font-medium leading-tight">
                    {iconLabel(key)}
                  </span>
                  {active ? (
                    <Check className="absolute right-1 top-1 h-3 w-3 text-forest-700" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <p className="px-1 py-3 text-center text-xs text-forest-700/60">
              No icons match “{query}”.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
