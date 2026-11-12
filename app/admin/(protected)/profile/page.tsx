import Link from "next/link";
import { CalendarDays, ShieldCheck, UserCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ChangePasswordForm, ProfileInfoForm } from "@/components/admin/profile-forms";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default async function AdminProfilePage() {
  const user = await requireAdmin();
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Summary Card */}
      <div className="card-surface border border-sand-200/80 bg-gradient-to-br from-cream via-white to-sand-50/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest-700 font-serif text-lg font-semibold text-gold-300 shadow-sm">
              {getInitials(user.name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl font-semibold text-forest-950">
                  {user.name}
                </h1>
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-3 py-0.5 text-xs font-semibold text-forest-950 ring-1 ring-gold-300/70">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold-700" aria-hidden />
                    Super Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest-100 px-3 py-0.5 text-xs font-semibold text-forest-800">
                    <UserCheck className="h-3.5 w-3.5 text-forest-600" aria-hidden />
                    Admin
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-forest-700/80">
                <span>{user.email}</span>
                <span className="inline-flex items-center gap-1 text-xs text-forest-700/60">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  Member since {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/admins"
            className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-4 py-2 text-xs font-semibold text-forest-800 transition-colors hover:bg-forest-50 hover:text-forest-950"
          >
            <Users className="h-3.5 w-3.5 text-forest-600" aria-hidden />
            Admin Accounts
          </Link>
        </div>

        {isSuperAdmin ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-gold-300/70 bg-gold-100/45 px-4 py-3 text-xs leading-relaxed text-forest-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden />
            <span>
              <strong className="font-semibold">Protected Super Admin account:</strong> Your account
              is automatically hidden from the Admin Accounts directory so it cannot be edited or
              deleted by anyone else. Use this Profile page to update your name, email, or password.
            </span>
          </div>
        ) : null}
      </div>

      {/* Two-Column Forms */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileInfoForm initialName={user.name} initialEmail={user.email} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}

