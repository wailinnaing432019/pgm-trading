import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "forest" | "gold" | "soil" | "neutral" | "outline";

const tones: Record<BadgeTone, string> = {
  forest: "bg-forest-700 text-cream",
  gold: "bg-gold-100 text-gold-700 ring-1 ring-gold-300/60",
  soil: "bg-soil-100 text-soil-800 ring-1 ring-soil-200",
  neutral: "bg-sand-100 text-forest-900 ring-1 ring-sand-200",
  outline: "border border-forest-700/25 text-forest-800",
};

export function Badge({
  className,
  tone = "forest",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}