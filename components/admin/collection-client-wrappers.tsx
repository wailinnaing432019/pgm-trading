"use client";

import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionItemCardProps {
  index: number;
  itemTitle: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function CollectionItemCard({
  index,
  itemTitle,
  defaultExpanded = true,
  children,
}: CollectionItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "card-surface overflow-hidden border border-sand-200/80 transition-all",
        isExpanded ? "shadow-card ring-1 ring-forest-600/5" : "hover:border-forest-300"
      )}
    >
      {/* Clickable Header Bar */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex cursor-pointer select-none items-center justify-between gap-3 bg-sand-50/40 p-4 transition-colors hover:bg-forest-50/50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-100 font-mono text-xs font-semibold text-forest-800">
            #{index + 1}
          </span>
          <span className="truncate font-medium text-forest-950 sm:text-base">
            {itemTitle}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-forest-700/60 transition-transform duration-200 hover:bg-sand-100"
            aria-label={isExpanded ? "Collapse item" : "Expand item"}
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && <div className="border-t border-sand-200/80 p-5">{children}</div>}
    </div>
  );
}

interface AddEntryDrawerProps {
  addLabel: string;
  children: React.ReactNode;
}

export function AddEntryDrawer({ addLabel, children }: AddEntryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all shadow-sm",
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
      </div>

      {isOpen && (
        <div className="card-surface mt-6 overflow-hidden border-2 border-dashed border-gold-400/70 bg-sand-50/60 p-6 shadow-md animate-fade-up">
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
              className="text-xs text-forest-700/60 hover:text-forest-900"
            >
              Cancel
            </button>
          </div>

          {children}
        </div>
      )}
    </div>
  );
}
