"use client";

import { useState } from "react";
import { Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function AutoTranslateFormButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleTranslate = async (e: React.MouseEvent<HTMLButtonElement>, target: "my" | "en") => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget.closest("form");
    if (!form) return;

    // Find all translatable fields in this form
    const selectors = [
      'input[name="title"]',
      'input[name="subtitle"]',
      'input[name="summary"]',
      'input[name="excerpt"]',
      'input[name="tagline"]',
      'input[name="name"]',
      'input[name="company"]',
      'textarea[name="summary"]',
      'textarea[name="excerpt"]',
      'textarea[name="description"]',
      'textarea[name="body"]',
    ];

    const fields: (HTMLInputElement | HTMLTextAreaElement)[] = [];
    selectors.forEach((sel) => {
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(sel).forEach((el) => {
        if (el.value && el.value.trim().length > 0) {
          fields.push(el);
        }
      });
    });

    if (fields.length === 0) return;

    setLoading(true);
    setDone(false);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: fields.map((f) => f.value),
          target,
        }),
      });

      const data = await res.json();
      if (data.ok && Array.isArray(data.translations)) {
        fields.forEach((f, idx) => {
          const val = data.translations[idx];
          if (val) {
            f.value = val;
            f.dispatchEvent(new Event("input", { bubbles: true }));
            f.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
        setDone(true);
        setTimeout(() => setDone(false), 2500);
      }
    } catch (err) {
      console.error("[AutoTranslateFormButton] error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        type="button"
        disabled={loading}
        onClick={(e) => handleTranslate(e, "my")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all",
          done
            ? "bg-emerald-100 text-emerald-800"
            : "bg-gold-400/20 text-forest-950 hover:bg-gold-400/35",
          loading && "opacity-50 cursor-not-allowed"
        )}
        title="Auto-translate these inputs into Myanmar Unicode"
      >
        {done ? (
          <>
            <Check className="h-3 w-3 text-emerald-700" />
            <span>Translated!</span>
          </>
        ) : (
          <>
            <Languages className={cn("h-3 w-3 text-gold-700", loading && "animate-spin")} />
            <span>{loading ? "Translating…" : "Auto-Translate (မြန်မာ)"}</span>
          </>
        )}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={(e) => handleTranslate(e, "en")}
        className="inline-flex items-center rounded-full border border-sand-300 bg-sand-50 px-2 py-0.5 text-[11px] font-medium text-forest-700 transition-colors hover:bg-forest-50 disabled:opacity-50"
        title="Translate back to English"
      >
        EN
      </button>
    </div>
  );
}
