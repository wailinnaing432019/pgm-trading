import { cn } from "@/lib/utils";

type PageGroupProps = {
  step?: number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Editorial section wrapper for grouping related blocks and lists inside the
 * admin page content editor.
 */
export function PageGroup({
  step,
  title,
  description,
  icon,
  badge,
  children,
  className,
}: PageGroupProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-sand-200/80 bg-white/75 px-5 py-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          {icon ? (
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-gold-300 shadow-xs">
              {icon}
            </span>
          ) : typeof step === "number" ? (
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-700 font-serif text-base font-semibold text-gold-300 shadow-xs">
              {step}
            </span>
          ) : null}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {typeof step === "number" && icon ? (
                <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-forest-700">
                  Part {step}
                </span>
              ) : null}
              <h2 className="font-serif text-lg font-semibold text-forest-950 sm:text-xl">
                {title}
              </h2>
            </div>
            {description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-forest-700/75 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {badge ? (
          <span className="shrink-0 rounded-full bg-forest-50 px-3 py-1 text-xs font-medium text-forest-700 ring-1 ring-forest-200/70">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="grid gap-5">{children}</div>
    </section>
  );
}

