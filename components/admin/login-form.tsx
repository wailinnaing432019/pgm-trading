"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { loginAdmin, type AdminActionState } from "@/lib/actions/admin";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useToast } from "@/components/admin/toast";

const initialState: AdminActionState = { ok: false };

export function LoginForm({ logo }: { logo?: string }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(loginAdmin, initialState);
  const { pushToast } = useToast();

  useEffect(() => {
    if (state.error) pushToast("error", state.error);
  }, [state, pushToast]);

  return (
    <div className="card-surface w-full max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-700 text-gold-300">
          <BrandLogo
            src={logo}
            className={logo ? "h-8 w-auto max-w-[120px]" : "h-9 w-9"}
          />
        </span>
        <div>
          <h1 className="font-serif text-xl font-semibold text-forest-950">PGM Admin</h1>
          <p className="text-sm text-forest-700/70">Content management system</p>
        </div>
      </div>

      <form action={action} className="mt-8 grid gap-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-forest-900">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@pgm-trading.com"
            className="h-12 w-full rounded-xl border border-sand-200 bg-cream px-4 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-forest-900">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-sand-200 bg-cream px-4 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-6 text-sm font-semibold text-cream transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-forest-700/60">
        Seeded credentials: admin@pgm-trading.com / admin123
      </p>
    </div>
  );
}