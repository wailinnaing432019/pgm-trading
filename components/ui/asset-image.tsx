import Image from "next/image";
import { Cpu, Leaf, Package } from "lucide-react";
import { cn } from "@/lib/utils";

type AssetImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** Render as a fancy gradient panel when no image is available. */
  placeholderIcon?: "leaf" | "package" | "crop";
  priority?: boolean;
  sizes?: string;
};

const icons = {
  leaf: Leaf,
  package: Package,
  crop: Cpu,
} as const;

export function AssetImage({
  src,
  alt,
  className,
  placeholderIcon = "leaf",
  priority,
  sizes = "(min-width: 1024px) 33vw, 50vw",
}: AssetImageProps) {
  if (!src) {
    const Icon = icons[placeholderIcon];
    return (
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br from-forest-600 via-forest-700 to-forest-950",
          className
        )}
        aria-label={alt}
        role="img"
      >
        <div className="grain absolute inset-0" />
        <Icon className="h-12 w-12 text-cream/30" strokeWidth={1} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}