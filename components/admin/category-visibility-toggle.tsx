"use client";

import { useFormStatus } from "react-dom";
import { toggleCategoryActive } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

function VisibilitySwitch({ name, isActive }: { name: string; isActive: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="switch"
      aria-checked={isActive}
      aria-label={`Show “${name}” on the site`}
      disabled={pending}
      title={
        isActive
          ? `Visible on the site — click to hide “${name}”`
          : `Hidden from the site — click to show “${name}”`
      }
      className={cn(
        "group inline-flex items-center gap-2 rounded-full py-0.5 pr-1 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2",
        pending && "cursor-wait opacity-50"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
          isActive ? "bg-forest-700" : "bg-sand-300",
          !pending && "group-hover:ring-2 group-hover:ring-forest-600/25"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
            isActive ? "translate-x-[1.125rem]" : "translate-x-0.5"
          )}
        />
      </span>
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          isActive ? "text-forest-800" : "text-forest-700/50"
        )}
      >
        {isActive ? "Visible" : "Hidden"}
      </span>
    </button>
  );
}

export function CategoryVisibilityToggle({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  return (
    <form action={toggleCategoryActive}>
      <input type="hidden" name="id" value={id} />
      <VisibilitySwitch name={name} isActive={isActive} />
    </form>
  );
}
