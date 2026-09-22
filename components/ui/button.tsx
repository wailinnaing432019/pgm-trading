import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-forest-700 text-cream hover:bg-forest-800 shadow-card focus-visible:ring-forest-600",
  secondary:
    "bg-cream text-forest-900 hover:bg-sand-100 shadow-card focus-visible:ring-forest-400",
  outline:
    "border border-forest-700/30 bg-transparent text-forest-900 hover:border-forest-700 hover:bg-forest-50 focus-visible:ring-forest-500",
  ghost: "text-forest-800 hover:bg-forest-100 hover:text-forest-950",
  gold: "bg-gold-500 text-forest-950 hover:bg-gold-400 shadow-card focus-visible:ring-gold-500",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, type, ...props }, ref) => {
    const classes = cn(baseClasses, variants[variant], sizes[size], className);

    if (href) {
      const { children, onClick } = props;
      return (
        <Link href={href} onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>} className={classes}>
          {children}
        </Link>
      );
    }

    return <button ref={ref} type={type ?? "button"} className={classes} {...props} />;
  }
);
Button.displayName = "Button";