"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, Tag, X } from "lucide-react";

type TagInputProps = {
  name?: string;
  initialTags?: string[];
  suggestedTags?: string[];
};

const DEFAULT_SUGGESTIONS = [
  "Rice & Grains",
  "Beans & Pulses",
  "Market Trends",
  "Export & Trade",
  "Shipping & Freight",
  "Quality Standards",
  "Company News",
  "Industry Insights",
];

export function TagInput({
  name = "tags",
  initialTags = [],
  suggestedTags = DEFAULT_SUGGESTIONS,
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState("");

  const addTag = (rawTag: string) => {
    const trimmed = rawTag.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={tags.join(", ")} />

      {/* Tag input box */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-sand-300 bg-white p-2.5 shadow-xs focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-400/20">
        <Tag className="ml-1.5 h-4 w-4 shrink-0 text-forest-500" aria-hidden />

        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1 rounded-lg bg-sand-100 px-2.5 py-1 text-xs font-medium text-forest-900"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-forest-500 hover:text-rose-600 transition"
              title={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue);
          }}
          placeholder={tags.length === 0 ? "Type tag and press Enter or comma..." : "Add more..."}
          className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-xs text-forest-950 placeholder:text-forest-700/40 focus:outline-none"
        />
      </div>

      {/* Suggested Tags */}
      {suggestedTags.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-forest-600/70">
            Suggested Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedTags.map((suggestion) => {
              const alreadySelected = tags.some(
                (t) => t.toLowerCase() === suggestion.toLowerCase()
              );
              return (
                <button
                  key={suggestion}
                  type="button"
                  disabled={alreadySelected}
                  onClick={() => addTag(suggestion)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    alreadySelected
                      ? "bg-sand-100 text-forest-400 cursor-default opacity-50"
                      : "bg-white border border-sand-200 text-forest-800 hover:border-gold-400 hover:bg-gold-50/50 hover:text-gold-900"
                  }`}
                >
                  <Plus className="h-2.5 w-2.5" />
                  {suggestion}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
