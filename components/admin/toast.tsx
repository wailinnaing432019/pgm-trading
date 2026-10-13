"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastMessage, ToastType } from "@/lib/toast";
import { clearAdminToast } from "@/lib/actions/admin";

type Toast = {
  id: number;
  type: ToastType;
  text: string;
};

type ToastContextValue = {
  toasts: Toast[];
  pushToast: (type: ToastType, text: string) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return value;
}

const TOAST_VISIBLE_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: ToastType, text: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, type, text }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_VISIBLE_MS);
    },
    []
  );

  const value = useMemo(() => ({ toasts, pushToast, dismiss }), [toasts, pushToast, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const icon =
    toast.type === "success" ? (
      <CheckCircle2 className="h-5 w-5 shrink-0 text-forest-600" aria-hidden />
    ) : toast.type === "error" ? (
      <AlertTriangle className="h-5 w-5 shrink-0 text-soil-600" aria-hidden />
    ) : (
      <Info className="h-5 w-5 shrink-0 text-forest-600" aria-hidden />
    );

  return (
    <div
      role="status"
      className={cn(
        "card-surface pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-lift animate-fade-up",
        toast.type === "error" && "border-soil-300"
      )}
    >
      {icon}
      <p className="flex-1 text-sm font-medium text-forest-950">{toast.text}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded-full p-1 text-forest-700/50 transition-colors hover:bg-sand-100 hover:text-forest-900"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export function ToastStack() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

/**
 * Renders a server-produced flash toast exactly once per nonce, then clears
 * the flash cookie so it can't replay on a later hard refresh.
 */
export function AdminFlash({ flash }: { flash: ToastMessage | null }) {
  const { pushToast } = useToast();
  const shownNonces = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!flash) return;
    if (shownNonces.current.has(flash.nonce)) return;

    shownNonces.current.add(flash.nonce);
    pushToast(flash.type, flash.text);
    void clearAdminToast();
  }, [flash, pushToast]);

  return null;
}