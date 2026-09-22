"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type DangerSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmText: string;
};

export const DangerSubmitButton = forwardRef<HTMLButtonElement, DangerSubmitButtonProps>(
  function DangerSubmitButton({ confirmText, children, onClick, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="submit"
        {...rest}
        onClick={(e) => {
          if (!window.confirm(confirmText)) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
      >
        {children}
      </button>
    );
  }
);