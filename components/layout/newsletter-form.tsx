"use client";

import { useActionState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { subscribeNewsletter, type ActionState } from "@/lib/actions/public";

const initialState: ActionState = { ok: false };

export function NewsletterForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(subscribeNewsletter, initialState);

  return (
    <div>
      <form action={action} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className="h-12 flex-1 rounded-full border border-cream/20 bg-forest-900/60 px-5 text-sm text-cream placeholder:text-cream/40 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-forest-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            "Subscribe"
          )}
        </button>
      </form>

      {state.ok ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-gold-300" role="status">
          <MailCheck className="h-4 w-4" aria-hidden />
          You are subscribed — welcome aboard.
        </p>
      ) : state.error ? (
        <p className="mt-3 text-sm text-soil-300" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}