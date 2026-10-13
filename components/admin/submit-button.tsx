"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "gold" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-forest-700 text-cream hover:bg-forest-800 disabled:opacity-60 shadow-sm",
  secondary: "bg-forest-100 text-forest-800 hover:bg-forest-700 hover:text-cream disabled:opacity-60",
  gold: "bg-gold-500 text-forest-950 hover:bg-gold-400 disabled:opacity-60 font-semibold shadow-sm",
  danger: "bg-soil-100 text-soil-800 hover:bg-soil-700 hover:text-cream disabled:opacity-60",
  outline: "border border-sand-300 text-forest-900 hover:bg-forest-50 disabled:opacity-60",
  ghost: "text-forest-700 hover:bg-forest-100 hover:text-forest-950 disabled:opacity-60",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-sm",
};

export function SubmitButton({
  children = "Save changes",
  pendingText = "Saving…",
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2 active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
          <span>{pendingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
