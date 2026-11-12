"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import {
  unsubscribeNewsletterAction,
  resubscribeNewsletterAction,
  type ActionState,
} from "@/lib/actions/public";

export function UnsubscribeForm({ initialEmail }: { initialEmail?: string }) {
  const [emailInput, setEmailInput] = useState(initialEmail || "");
  const [isResubscribed, setIsResubscribed] = useState(false);

  const [unsubState, unsubAction, isPendingUnsub] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      setIsResubscribed(false);
      return unsubscribeNewsletterAction(prev, formData);
    },
    { ok: false }
  );

  const [, resubAction, isPendingResub] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const res = await resubscribeNewsletterAction(prev, formData);
      if (res.ok) setIsResubscribed(true);
      return res;
    },
    { ok: false }
  );

  const isUnsubscribed = unsubState.ok && !isResubscribed;

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
      {isResubscribed ? (
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-700">
            <CheckCircle2 className="h-8 w-8 text-forest-700" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-forest-950">You are Subscribed!</h2>
          <p className="mt-2 text-sm text-forest-800/80">
            Welcome back! You will receive periodic market updates and commodity export reports for{" "}
            <strong>{emailInput}</strong>.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-900"
            >
              Browse Products
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-sand-100 px-6 py-2.5 text-sm font-semibold text-forest-900 transition hover:bg-sand-200"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      ) : isUnsubscribed ? (
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand-100 text-forest-700">
            <CheckCircle2 className="h-8 w-8 text-forest-700" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-forest-950">Unsubscribed Successfully</h2>
          <p className="mt-2 text-sm text-forest-800/80">
            <strong>{emailInput}</strong> has been removed from our marketing and broadcast email list.
            You will no longer receive periodic newsletters or promotional updates from Pacific Global Myanmar.
          </p>

          <div className="mt-8 rounded-xl border border-dashed border-sand-300 bg-sand-50/50 p-4">
            <p className="text-xs text-forest-700/70">
              Unsubscribed by mistake? You can re-subscribe anytime:
            </p>
            <form action={resubAction} className="mt-3">
              <input type="hidden" name="email" value={emailInput} />
              <button
                type="submit"
                disabled={isPendingResub}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-4 py-2 text-xs font-semibold text-forest-800 transition hover:bg-forest-700 hover:text-cream disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPendingResub ? "animate-spin" : ""}`} />
                {isPendingResub ? "Re-subscribing..." : "Re-subscribe to Market Updates"}
              </button>
            </form>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700 hover:text-forest-900"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Pacific Global Myanmar
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-forest-700">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-forest-950">Email Preferences</h2>
              <p className="text-xs text-forest-700/70">Manage your subscription to PGM trade updates</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-forest-800/80 leading-relaxed">
            We only send periodic agricultural trade digests, FOB Yangon commodity price updates, and seasonal harvest
            reports. If you no longer wish to receive these communications, please confirm below.
          </p>

          {unsubState.error ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{unsubState.error}</span>
            </div>
          ) : null}

          <form action={unsubAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="unsub-email" className="block text-xs font-semibold uppercase tracking-wider text-forest-800/70">
                Email Address
              </label>
              <input
                id="unsub-email"
                type="email"
                name="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                placeholder="name@company.com"
                className="mt-1.5 h-11 w-full rounded-xl border border-sand-300 bg-sand-50/40 px-3.5 text-sm text-forest-950 placeholder:text-forest-700/40 focus:border-forest-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPendingUnsub || !emailInput}
                className="w-full rounded-full bg-soil-800 py-3 text-sm font-semibold text-cream shadow-sm transition hover:bg-soil-900 disabled:opacity-50"
              >
                {isPendingUnsub ? "Processing Unsubscribe..." : "Confirm Unsubscribe"}
              </button>
            </div>

            <p className="text-center text-xs text-forest-700/60">
              Your preferences will take effect immediately.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
