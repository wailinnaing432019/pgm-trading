import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/newsletter/unsubscribe-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Unsubscribe from Newsletter — Pacific Global Myanmar",
  description: "Manage your subscription preferences for Pacific Global Myanmar trade alerts and market reports.",
  path: "/unsubscribe",
});

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="min-h-[70vh] bg-sand-50/50 py-16 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">
            Pacific Global Myanmar
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-forest-950">
            Newsletter Unsubscribe
          </h1>
        </div>

        <UnsubscribeForm initialEmail={email} />
      </div>
    </main>
  );
}

