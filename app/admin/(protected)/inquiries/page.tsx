import Link from "next/link";
import { Inbox, Trash2, MailCheck } from "lucide-react";
import {
  getAdminInquiries,
  getAdminNewsletterSubscribers,
  getAdminBroadcastProducts,
} from "@/lib/queries";
import { deleteInquiry, updateInquiryStatus } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";
import { formatDate } from "@/lib/utils";
import { NewsletterManager } from "@/components/admin/newsletter-manager";

const statusTones = {
  NEW: "gold",
  IN_PROGRESS: "forest",
  RESOLVED: "neutral",
  ARCHIVED: "soil",
} as const;

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tab?: string }>;
}) {
  const { status, tab } = await searchParams;
  const isNewsletterTab = tab === "newsletter";

  const [inquiries, subscribers, broadcastProducts] = await Promise.all([
    !isNewsletterTab ? getAdminInquiries(status) : Promise.resolve([]),
    isNewsletterTab ? getAdminNewsletterSubscribers() : Promise.resolve([]),
    isNewsletterTab ? getAdminBroadcastProducts() : Promise.resolve([]),
  ]);

  const inquiryFilters = [
    { label: "All", value: "" },
    { label: "New", value: "NEW" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Section Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-950">
            {isNewsletterTab ? "Newsletter & Broadcast" : "Inquiries & Leads"}
          </h1>
          <p className="mt-1 text-sm text-forest-700/70">
            {isNewsletterTab
              ? "Manage website newsletter subscribers and compose market digest broadcasts."
              : "Customer inquiries, RFQ submissions, and trade desk contact leads."}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center rounded-full bg-sand-200/80 p-1">
          <Link
            href="/admin/inquiries"
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
              !isNewsletterTab
                ? "bg-white text-forest-950 shadow-sm"
                : "text-forest-800 hover:text-forest-950"
            }`}
          >
            <Inbox className="h-3.5 w-3.5" /> Customer Inquiries
          </Link>
          <Link
            href="/admin/inquiries?tab=newsletter"
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
              isNewsletterTab
                ? "bg-white text-forest-950 shadow-sm"
                : "text-forest-800 hover:text-forest-950"
            }`}
          >
            <MailCheck className="h-3.5 w-3.5" /> Newsletter & Broadcast
          </Link>
        </div>
      </div>

      {isNewsletterTab ? (
        <NewsletterManager
          subscribers={subscribers.map((s) => ({
            id: s.id,
            email: s.email,
            subscribed: s.subscribed,
            createdAt: s.createdAt,
          }))}
          products={broadcastProducts.map((p) => ({
            id: p.id,
            title: p.title,
            summary: p.summary,
            price: p.price,
            unit: p.unit,
            currency: p.currency,
            images: p.images,
          }))}
        />
      ) : (
        <div>
          <div className="flex flex-wrap gap-2">
            {inquiryFilters.map((f) => (
              <a
                key={f.value}
                href={f.value ? `/admin/inquiries?status=${f.value}` : "/admin/inquiries"}
                className={
                  (status ?? "") === f.value
                    ? "rounded-full bg-forest-700 px-4 py-2 text-sm font-medium text-cream"
                    : "rounded-full bg-white px-4 py-2 text-sm font-medium text-forest-800 ring-1 ring-sand-200 hover:bg-forest-50"
                }
              >
                {f.label}
              </a>
            ))}
          </div>

          <div className="mt-8 grid gap-5">
            {inquiries.length > 0 ? (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="card-surface p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-lg font-semibold text-forest-950">
                        {inquiry.subject}
                      </h2>
                      <p className="mt-1 text-sm text-forest-700/75">
                        {inquiry.name} ·{" "}
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="font-medium text-forest-700 underline underline-offset-4"
                        >
                          {inquiry.email}
                        </a>
                        {inquiry.phone ? ` · ${inquiry.phone}` : null}
                      </p>
                      <p className="mt-0.5 text-xs text-forest-700/60">
                        Received {formatDate(inquiry.createdAt)}
                      </p>
                    </div>
                    <Badge tone={statusTones[inquiry.status]}>
                      {inquiry.status.replace("_", " ").toLowerCase()}
                    </Badge>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-forest-900">
                    {inquiry.message}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-200 pt-4">
                    <form action={updateInquiryStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={inquiry.id} />
                      <select
                        name="status"
                        defaultValue={inquiry.status}
                        className="h-10 rounded-full border border-sand-200 bg-cream px-3 text-sm text-forest-900"
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center rounded-full bg-forest-100 px-4 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-700 hover:text-cream"
                      >
                        Update
                      </button>
                    </form>

                    <form action={deleteInquiry} className="ml-auto">
                      <input type="hidden" name="id" value={inquiry.id} />
                      <DangerSubmitButton
                        confirmText="Delete this inquiry?"
                        className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-soil-800 transition-colors hover:bg-soil-100"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden /> Delete
                      </DangerSubmitButton>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-sand-300 bg-white/60 px-6 py-16 text-center">
                <Inbox className="h-10 w-10 text-forest-700/40" aria-hidden />
                <p className="font-serif text-lg font-semibold text-forest-950">No inquiries here</p>
                <p className="max-w-md text-sm text-forest-800/70">
                  New contact form submissions will appear here as soon as visitors send them.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
