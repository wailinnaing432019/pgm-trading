"use client";

import { useActionState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { submitInquiry, type ActionState } from "@/lib/actions/public";

const initialState: ActionState = { ok: false };

export function InquiryForm({ initialSubject }: { initialSubject?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitInquiry, initialState);

  return (
    <form action={action} className="card-surface grid gap-5 p-7 sm:grid-cols-2">
      <div>
        <label htmlFor="inquiry-name" className="mb-1.5 block text-sm font-medium text-forest-900">Full name *</label>
        <input id="inquiry-name" name="name" required placeholder="Daw Su Su" className="h-12 w-full rounded-xl border border-sand-200 bg-cream px-4 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30" />
      </div>
      <div>
        <label htmlFor="inquiry-email" className="mb-1.5 block text-sm font-medium text-forest-900">Work email *</label>
        <input id="inquiry-email" name="email" type="email" required placeholder="you@company.com" className="h-12 w-full rounded-xl border border-sand-200 bg-cream px-4 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30" />
      </div>
      <div>
        <label htmlFor="inquiry-phone" className="mb-1.5 block text-sm font-medium text-forest-900">Phone / WhatsApp</label>
        <input id="inquiry-phone" name="phone" placeholder="+95 …" className="h-12 w-full rounded-xl border border-sand-200 bg-cream px-4 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30" />
      </div>
      <div>
        <label htmlFor="inquiry-subject" className="mb-1.5 block text-sm font-medium text-forest-900">Subject *</label>
        <input
          id="inquiry-subject"
          name="subject"
          required
          defaultValue={initialSubject}
          placeholder="FOB quote for jasmine rice"
          className="h-12 w-full rounded-xl border border-sand-200 bg-cream px-4 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="inquiry-message" className="mb-1.5 block text-sm font-medium text-forest-900">Message *</label>
        <textarea
          id="inquiry-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us the product, quantity, destination port and target timeline…"
          className="w-full rounded-xl border border-sand-200 bg-cream px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
      </div>

      {state.fieldErrors?.message ? (
        <p className="text-sm text-soil-700 sm:col-span-2">{state.fieldErrors.message[0]}</p>
      ) : null}

      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-8 text-sm font-semibold text-cream transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Send Inquiry"}
        </button>
        {state.ok ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-forest-700" role="status">
            <MailCheck className="h-4 w-4" aria-hidden /> Thanks — we&apos;ll reply within one business day.
          </p>
        ) : state.error ? (
          <p className="text-sm text-soil-700" role="alert">{state.error}</p>
        ) : null}
      </div>
    </form>
  );
}