"use client";

import { useActionState } from "react";
import { HardDrive, Sparkles } from "lucide-react";
import { cleanOrphanedMediaAction, type AdminActionState } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/admin/submit-button";

export function MediaCleanerCard() {
  const [, formAction] = useActionState<AdminActionState, FormData>(
    async () => {
      return cleanOrphanedMediaAction();
    },
    { ok: false }
  );

  return (
    <div className="card-surface mt-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 max-w-xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-800">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold text-forest-950">
                Server Storage & Media Maintenance
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-sand-200 px-2 py-0.5 text-[11px] font-semibold text-forest-800">
                <Sparkles className="h-3 w-3 text-gold-600" /> Auto-clean enabled
              </span>
            </div>
            <p className="mt-1 text-xs text-forest-700/75 leading-relaxed">
              When products or news articles are edited or deleted, replaced photos are automatically removed from disk.
              You can also run a deep scan anytime to purge any leftover orphaned files and reclaim cloud server disk space.
            </p>
          </div>
        </div>

        <form action={formAction}>
          <SubmitButton
            variant="outline"
            pendingText="Scanning & Cleaning..."
            className="rounded-full border-sand-300 bg-white px-5 py-2.5 text-xs font-semibold text-forest-900 shadow-sm transition hover:bg-forest-50"
          >
            Purge Orphaned Media Files
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
