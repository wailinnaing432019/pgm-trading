import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-600">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="max-w-2xl text-3xl font-semibold text-forest-950 sm:text-4xl">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-forest-800/80",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}