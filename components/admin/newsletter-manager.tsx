"use client";

import { useActionState, useState } from "react";
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Info,
} from "lucide-react";
import {
  sendNewsletterBroadcastAction,
  toggleNewsletterSubscriber,
  deleteNewsletterSubscriber,
  type AdminActionState,
} from "@/lib/actions/admin";
import { SubmitButton } from "@/components/admin/submit-button";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";
import { formatDate } from "@/lib/utils";

export type SubscriberItem = {
  id: string;
  email: string;
  subscribed: boolean;
  createdAt: Date | string;
};

export type BroadcastProductOption = {
  id: string;
  title: string;
  summary: string;
  price?: number | null;
  unit?: string | null;
  currency?: string | null;
  images?: string[];
};

export function NewsletterManager({
  subscribers,
  products,
}: {
  subscribers: SubscriberItem[];
  products: BroadcastProductOption[];
}) {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);

  const activeCount = subscribers.filter((s) => s.subscribed).length;
  const unsubscribedCount = subscribers.length - activeCount;

  const [state, formAction] = useActionState<AdminActionState, FormData>(
    async (prev, formData) => {
      const res = await sendNewsletterBroadcastAction(prev, formData);
      if (res.ok) {
        setShowBroadcastForm(false);
        setSelectedProductIds([]);
      }
      return res;
    },
    { ok: false }
  );

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-forest-700/70">
                Active Subscribers
              </p>
              <p className="font-serif text-2xl font-bold text-forest-950">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-200 text-forest-800">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-forest-700/70">
                Total Signups
              </p>
              <p className="font-serif text-2xl font-bold text-forest-950">{subscribers.length}</p>
            </div>
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-soil-100 text-soil-800">
              <ToggleLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-forest-700/70">
                Unsubscribed
              </p>
              <p className="font-serif text-2xl font-bold text-forest-950">{unsubscribedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast CTA & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold-300 bg-gold-50/60 p-6 shadow-sm">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-700" />
            <h3 className="font-serif text-lg font-semibold text-forest-950">
              Market Update & Product Digest
            </h3>
          </div>
          <p className="mt-1 text-sm text-forest-800/80 leading-relaxed">
            Compose a broadcast email with market notes and featured products. Every broadcast
            automatically includes company branding, direct product specifications links, and mandatory
            one-click unsubscribe compliance to protect your domain.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBroadcastForm((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-5 py-2.5 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest-900"
        >
          <Send className="h-4 w-4" />
          {showBroadcastForm ? "Close Broadcast Composer" : "Compose New Broadcast"}
        </button>
      </div>

      {/* Broadcast Form Drawer / Section */}
      {showBroadcastForm && (
        <div className="card-surface border-2 border-forest-600/30 p-6 shadow-md animate-fade-up sm:p-8">
          <div className="border-b border-sand-200 pb-4">
            <h3 className="font-serif text-xl font-bold text-forest-950">
              Compose Newsletter Broadcast
            </h3>
            <p className="text-xs text-forest-700/70 mt-1">
              Will be sent to <strong>{activeCount} active subscriber{activeCount === 1 ? "" : "s"}</strong>.
            </p>
          </div>

          {state.error ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          ) : null}

          <form action={formAction} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/70">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. PGM Market Insights: Sesame Seed & Pulses Export Prices"
                  className="mt-1.5 h-11 w-full rounded-xl border border-sand-300 bg-sand-50/40 px-3.5 text-sm text-forest-950 placeholder:text-forest-700/40 focus:border-forest-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
                {state.fieldErrors?.subject ? (
                  <p className="mt-1 text-xs text-red-600">{state.fieldErrors.subject[0]}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/70">
                  Headline / Article Title *
                </label>
                <input
                  type="text"
                  name="headline"
                  required
                  placeholder="e.g. 2026 Harvest Season Outlook & FOB Yangon Rates"
                  className="mt-1.5 h-11 w-full rounded-xl border border-sand-300 bg-sand-50/40 px-3.5 text-sm text-forest-950 placeholder:text-forest-700/40 focus:border-forest-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
                {state.fieldErrors?.headline ? (
                  <p className="mt-1 text-xs text-red-600">{state.fieldErrors.headline[0]}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/70">
                Market Message & Commentary *
              </label>
              <textarea
                name="message"
                rows={5}
                required
                placeholder="Share seasonal updates, harvest volumes, export certification standards, or shipping logistics notes..."
                className="mt-1.5 w-full rounded-xl border border-sand-300 bg-sand-50/40 p-3.5 text-sm text-forest-950 placeholder:text-forest-700/40 focus:border-forest-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
              {state.fieldErrors?.message ? (
                <p className="mt-1 text-xs text-red-600">{state.fieldErrors.message[0]}</p>
              ) : null}
            </div>

            {/* Featured Products Picker */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-forest-800/70">
                  Attach Featured Products (Optional)
                </label>
                <span className="text-xs text-forest-700/60">
                  {selectedProductIds.length} product{selectedProductIds.length === 1 ? "" : "s"} selected
                </span>
              </div>
              <p className="text-xs text-forest-700/60 mt-0.5">
                Selected products will be displayed as cards in the email with photos, prices, and direct links to their specifications.
              </p>

              {products.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 max-h-60 overflow-y-auto p-1 border border-sand-200 rounded-xl bg-sand-50/30">
                  {products.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className={`flex items-start gap-2.5 rounded-lg p-2.5 text-left text-xs transition border ${
                          isSelected
                            ? "border-forest-600 bg-forest-50/80 text-forest-950 font-medium"
                            : "border-sand-200 bg-white text-forest-800 hover:bg-sand-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Controlled by button
                          className="mt-0.5 h-3.5 w-3.5 rounded border-sand-300 text-forest-700 focus:ring-forest-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-forest-950">{p.title}</p>
                          <p className="truncate text-forest-700/70 text-[11px]">{p.summary}</p>
                          {p.price ? (
                            <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                              {p.currency || "USD"} {p.price.toLocaleString()}{p.unit ? ` / ${p.unit}` : ""}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-xs text-forest-700/60">No published products available to feature.</p>
              )}

              {/* Hidden inputs to send selected IDs in form data */}
              {selectedProductIds.map((id) => (
                <input key={id} type="hidden" name="productIds" value={id} />
              ))}
            </div>

            {/* Anti-spam notice box */}
            <div className="flex items-start gap-2 rounded-xl border border-sand-200 bg-sand-50/80 p-3.5 text-xs text-forest-800/80">
              <Info className="h-4 w-4 shrink-0 text-forest-700 mt-0.5" />
              <span>
                <strong>Deliverability Safeguard:</strong> Emails are sent with List-Unsubscribe headers
                and throttled at safe intervals to prevent exceeding Google / SMTP limits and avoid domain flags.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-200">
              <button
                type="button"
                onClick={() => setShowBroadcastForm(false)}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-forest-800 transition hover:bg-sand-100"
              >
                Cancel
              </button>
              <SubmitButton
                pendingText="Dispatching emails..."
                disabled={activeCount === 0}
                className="rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-cream hover:bg-forest-900"
              >
                Send Broadcast to {activeCount} Subscribers
              </SubmitButton>
            </div>
          </form>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="card-surface overflow-hidden">
        <div className="border-b border-sand-200 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold text-forest-950">Subscriber List</h3>
            <p className="text-xs text-forest-700/70">
              Visitors who signed up via the website footer newsletter form.
            </p>
          </div>
          <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-forest-800">
            {subscribers.length} total
          </span>
        </div>

        {subscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand-50/80 text-xs uppercase tracking-wider text-forest-700/70 border-b border-sand-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Subscriber Email</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Date Subscribed</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-sand-50/40 transition">
                    <td className="px-6 py-4 font-medium text-forest-950">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-forest-600/70" />
                        <a href={`mailto:${sub.email}`} className="hover:underline">
                          {sub.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.subscribed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sand-200 px-2.5 py-0.5 text-xs font-medium text-forest-800/70">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-forest-700/70">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleNewsletterSubscriber}>
                          <input type="hidden" name="id" value={sub.id} />
                          <button
                            type="submit"
                            title={sub.subscribed ? "Mark as Unsubscribed" : "Mark as Active"}
                            className="inline-flex items-center gap-1 rounded-full border border-sand-300 bg-white px-2.5 py-1 text-xs font-medium text-forest-800 hover:bg-sand-50"
                          >
                            {sub.subscribed ? (
                              <>
                                <ToggleRight className="h-3.5 w-3.5 text-emerald-700" /> Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-3.5 w-3.5 text-forest-500" /> Activate
                              </>
                            )}
                          </button>
                        </form>

                        <form action={deleteNewsletterSubscriber}>
                          <input type="hidden" name="id" value={sub.id} />
                          <DangerSubmitButton
                            confirmText="Delete subscriber?"
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-soil-800 hover:bg-soil-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </DangerSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-forest-700/60">
            No newsletter subscribers yet. Submissions from the website footer will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
