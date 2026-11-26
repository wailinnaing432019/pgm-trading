"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";

type DangerSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmText: string;
  confirmTitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const DangerSubmitButton = forwardRef<HTMLButtonElement, DangerSubmitButtonProps>(
  function DangerSubmitButton(
    {
      confirmText,
      confirmTitle = "Confirm Deletion",
      confirmLabel = "Delete permanently",
      cancelLabel = "Cancel",
      children,
      onClick,
      form,
      disabled,
      ...rest
    },
    forwardedRef
  ) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
    const hiddenSubmitRef = useRef<HTMLButtonElement | null>(null);
    const titleId = useId();
    const descId = useId();

    const setTriggerRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    const closeModal = useCallback(() => {
      setOpen(false);
      // Restore focus to the trigger button after closing
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }, []);

    useEffect(() => {
      if (!open) return;

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Default focus to Cancel so accidental Enter key presses stay safe
      const focusTimer = requestAnimationFrame(() => {
        cancelBtnRef.current?.focus();
      });

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeModal();
        }
      }

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        cancelAnimationFrame(focusTimer);
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, closeModal]);

    function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
      onClick?.(event);
      setOpen(false);
      hiddenSubmitRef.current?.click();
    }

    return (
      <>
        <button
          ref={setTriggerRef}
          disabled={disabled}
          {...rest}
          type="button"
          onClick={() => setOpen(true)}
        >
          {children}
        </button>

        {/* Native hidden submit preserves parent <form action={...}> and external form={id} bindings */}
        <button
          ref={hiddenSubmitRef}
          type="submit"
          form={form}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
        />

        {open && typeof document !== "undefined"
          ? createPortal(
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descId}
              >
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-forest-950/60 backdrop-blur-[2px] transition-opacity"
                  onClick={closeModal}
                  aria-hidden="true"
                />

                {/* Modal Card */}
                <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-lift animate-fade-up">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soil-100 text-soil-700 ring-4 ring-soil-50">
                        <AlertTriangle className="h-5 w-5" aria-hidden />
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3
                          id={titleId}
                          className="font-serif text-lg font-semibold text-forest-950"
                        >
                          {confirmTitle}
                        </h3>
                        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-soil-600">
                          Irreversible action
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-full p-1.5 text-forest-700/60 transition-colors hover:bg-sand-100 hover:text-forest-950"
                        aria-label="Close confirmation dialog"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>

                    <p
                      id={descId}
                      className="mt-4 text-sm leading-relaxed text-forest-800/85"
                    >
                      {confirmText}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 border-t border-sand-200/80 bg-sand-50/80 px-6 py-4">
                    <button
                      ref={cancelBtnRef}
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-sand-300 bg-white px-4 text-xs font-semibold text-forest-800 transition-colors hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                    >
                      {cancelLabel}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-soil-700 px-5 text-xs font-semibold text-cream shadow-xs transition-colors hover:bg-soil-800 focus:outline-none focus:ring-2 focus:ring-soil-500/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      <span>{confirmLabel}</span>
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null}
      </>
    );
  }
);
