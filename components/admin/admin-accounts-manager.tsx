"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Mail,
  Newspaper,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  createAdminAccount,
  deleteAdminAccount,
  updateAdminAccount,
  type AdminActionState,
} from "@/lib/actions/admin";
import { AddEntryDrawer, useAddDrawerClose } from "@/components/admin/collection-client-wrappers";
import { PasswordInput } from "@/components/admin/password-input";
import { SubmitButton } from "@/components/admin/submit-button";
import { DangerSubmitButton } from "@/components/ui/danger-submit-button";
import { useToast } from "@/components/admin/toast";
import { cn, formatDate } from "@/lib/utils";

export type AdminAccountItem = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  articleCount: number;
};

const initialState: AdminActionState = { ok: false };

function FieldError({
  fieldErrors,
  name,
}: {
  fieldErrors?: Record<string, string[] | undefined>;
  name: string;
}) {
  const message = fieldErrors?.[name]?.[0];
  return message ? (
    <p className="mt-1 text-xs font-medium text-soil-700" role="alert">
      {message}
    </p>
  ) : null;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function CreateAdminForm() {
  const closeDrawer = useAddDrawerClose();
  const { pushToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState<AdminActionState, FormData>(
    async (prev, formData) => {
      const result = await createAdminAccount(prev, formData);
      if (result.ok) {
        formRef.current?.reset();
        closeDrawer?.();
      } else {
        const err =
          result.error ?? Object.values(result.fieldErrors ?? {}).flat().find(Boolean);
        if (err) pushToast("error", err);
      }
      return result;
    },
    initialState
  );

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      {!state.ok && state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-soil-300 bg-soil-50 px-3.5 py-2.5 text-xs font-medium text-soil-900"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-soil-700" aria-hidden />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="create-admin-name" className="mb-1.5 block text-sm font-medium text-forest-900">
            Full Name *
          </label>
          <input
            id="create-admin-name"
            name="name"
            required
            placeholder="e.g. Su Myat"
            className="input-admin"
          />
          <FieldError fieldErrors={state.fieldErrors} name="name" />
        </div>

        <div>
          <label htmlFor="create-admin-email" className="mb-1.5 block text-sm font-medium text-forest-900">
            Email Address *
          </label>
          <input
            id="create-admin-email"
            name="email"
            type="email"
            required
            placeholder="admin@pgm-trading.com"
            className="input-admin"
          />
          <FieldError fieldErrors={state.fieldErrors} name="email" />
        </div>

        <div>
          <label htmlFor="create-admin-password" className="mb-1.5 block text-sm font-medium text-forest-900">
            Password *
          </label>
          <PasswordInput
            id="create-admin-password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
          <FieldError fieldErrors={state.fieldErrors} name="password" />
        </div>

        <div>
          <label htmlFor="create-admin-confirm" className="mb-1.5 block text-sm font-medium text-forest-900">
            Confirm Password *
          </label>
          <PasswordInput
            id="create-admin-confirm"
            name="confirmPassword"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Re-enter password"
          />
          <FieldError fieldErrors={state.fieldErrors} name="confirmPassword" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sand-200/80 pt-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-forest-900">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked
            className="h-4 w-4 rounded border-sand-300 accent-forest-700"
          />
          <span>Account active (allow signing in immediately)</span>
        </label>

        <SubmitButton variant="gold" pendingText="Creating admin…">
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          <span>Create Admin Account</span>
        </SubmitButton>
      </div>
    </form>
  );
}

function AdminAccountCard({
  admin,
  isSelf,
  isOpen,
  onToggle,
}: {
  admin: AdminAccountItem;
  isSelf: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { pushToast } = useToast();
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [isActive, setIsActive] = useState(admin.isActive);
  const [password, setPassword] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  const [state, formAction] = useActionState<AdminActionState, FormData>(
    async (prev, formData) => {
      const result = await updateAdminAccount(prev, formData);
      if (result.ok) {
        setPassword("");
        setSavedNotice(true);
      } else {
        const err =
          result.error ?? Object.values(result.fieldErrors ?? {}).flat().find(Boolean);
        if (err) pushToast("error", err);
      }
      return result;
    },
    initialState
  );

  useEffect(() => {
    if (!savedNotice) return;
    const timer = window.setTimeout(() => setSavedNotice(false), 3000);
    return () => window.clearTimeout(timer);
  }, [savedNotice]);

  const deleteFormId = `delete-admin-${admin.id}`;

  return (
    <div
      className={cn(
        "card-surface border transition-all duration-200",
        isOpen
          ? "border-forest-500/40 shadow-lift ring-2 ring-forest-600/10"
          : "border-sand-200/80 hover:border-forest-300 hover:shadow-md"
      )}
    >
      {/* Header Row */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 p-4 transition-colors sm:px-5",
          isOpen ? "rounded-t-2xl bg-forest-50/40" : "rounded-2xl bg-white"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
        >
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-serif text-sm font-semibold",
              admin.isActive
                ? "bg-forest-100 text-forest-800"
                : "bg-sand-200 text-forest-700/60"
            )}
          >
            {getInitials(admin.name)}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-serif text-base font-semibold text-forest-950">
                {admin.name}
              </h3>

              {isSelf ? (
                <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-semibold text-forest-950">
                  You
                </span>
              ) : null}

              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  admin.isActive
                    ? "bg-forest-100 text-forest-800"
                    : "bg-sand-200 text-forest-700/75"
                )}
              >
                {admin.isActive ? "Active" : "Disabled"}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-forest-700/75">
              <span className="inline-flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0 text-forest-600/70" aria-hidden />
                {admin.email}
              </span>
              <span className="inline-flex items-center gap-1 text-forest-700/60">
                <Newspaper className="h-3 w-3 shrink-0" aria-hidden />
                {admin.articleCount} {admin.articleCount === 1 ? "article" : "articles"}
              </span>
              <span className="hidden text-forest-700/55 sm:inline">
                Added {formatDate(admin.createdAt)}
              </span>
            </div>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              isOpen
                ? "bg-forest-700 text-cream"
                : "border border-sand-200 bg-white text-forest-800 hover:bg-forest-50"
            )}
          >
            {!isOpen ? <Pencil className="h-3 w-3" aria-hidden /> : null}
            <span>{isOpen ? "Editing" : "Edit"}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>

          {!isSelf ? (
            <DangerSubmitButton
              form={deleteFormId}
              confirmText={`Delete admin account "${admin.name}" (${admin.email})? They will immediately lose access to the dashboard.`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-soil-100 px-3 text-xs font-semibold text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Delete</span>
            </DangerSubmitButton>
          ) : null}
        </div>
      </div>

      <form id={deleteFormId} action={deleteAdminAccount} hidden>
        <input type="hidden" name="id" value={admin.id} />
      </form>

      {/* Expanded Edit Panel */}
      {isOpen ? (
        <form
          action={formAction}
          className="grid gap-4 border-t border-sand-200/80 p-5"
        >
          <input type="hidden" name="id" value={admin.id} />

          {!state.ok && state.error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-soil-300 bg-soil-50 px-3.5 py-2.5 text-xs font-medium text-soil-900"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-soil-700" aria-hidden />
              <span>{state.error}</span>
            </div>
          ) : null}

          {savedNotice ? (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2 text-xs font-semibold text-forest-800"
            >
              <Check className="h-4 w-4 text-forest-600" aria-hidden />
              Admin account updated!
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Full Name *
              </label>
              <input
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-admin"
              />
              <FieldError fieldErrors={state.fieldErrors} name="name" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-admin"
              />
              <FieldError fieldErrors={state.fieldErrors} name="email" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">
              Reset Password (optional)
            </label>
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Leave blank to keep their current password"
            />
            <p className="mt-1 text-xs text-forest-700/65">
              Enter 6+ characters only if you want to assign a new password.
            </p>
            <FieldError fieldErrors={state.fieldErrors} name="password" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sand-200/80 pt-4">
            {isSelf ? (
              <div className="flex items-center gap-2 text-xs text-forest-700/75">
                <input type="hidden" name="isActive" value="on" />
                <ShieldAlert className="h-4 w-4 text-gold-600" aria-hidden />
                <span>
                  This is your active account — manage your password on{" "}
                  <Link href="/admin/profile" className="font-semibold text-forest-800 underline">
                    My Profile
                  </Link>
                  .
                </span>
              </div>
            ) : (
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-forest-900">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-sand-300 accent-forest-700"
                />
                <span>Account active (can sign in)</span>
              </label>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold text-forest-700/75 transition-colors hover:bg-sand-100 hover:text-forest-950"
              >
                Close
              </button>
              <SubmitButton variant="primary" size="sm" pendingText="Saving…">
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                <span>Save changes</span>
              </SubmitButton>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function AdminAccountsManager({
  admins,
  currentUserId,
  currentUserRole,
}: {
  admins: AdminAccountItem[];
  currentUserId: string;
  currentUserRole: "ADMIN" | "SUPER_ADMIN";
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const term = search.trim().toLowerCase();
  const filtered = admins.filter((admin) => {
    if (statusFilter === "active" && !admin.isActive) return false;
    if (statusFilter === "disabled" && admin.isActive) return false;
    if (!term) return true;
    return (
      admin.name.toLowerCase().includes(term) || admin.email.toLowerCase().includes(term)
    );
  });

  const activeCount = admins.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Info + Add Drawer Card */}
      <div className="card-surface border border-sand-200/80 p-5 sm:p-6">
        <AddEntryDrawer
          addLabel="Add Admin"
          header={
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-700 text-gold-300 shadow-xs">
                  <Users className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-serif text-2xl font-semibold text-forest-950">
                      Admin Accounts
                    </h1>
                    <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-semibold text-forest-800">
                      {activeCount} active / {admins.length} total
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-forest-700/75">
                    Add teammates who can manage products, news, inquiries, and website content.
                  </p>
                </div>
              </div>
            </div>
          }
        >
          <CreateAdminForm />
        </AddEntryDrawer>

        {/* Super Admin protection reassurance notice */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand-200 bg-sand-50/80 px-4 py-3 text-xs text-forest-800/85">
          <div className="flex items-start gap-2 sm:items-center">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 sm:mt-0" aria-hidden />
            <span>
              Super Admin accounts are protected and hidden from this list so they cannot be edited
              or deleted here.
            </span>
          </div>
          {currentUserRole === "SUPER_ADMIN" ? (
            <Link
              href="/admin/profile"
              className="inline-flex shrink-0 items-center gap-1 font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-950"
            >
              <UserCheck className="h-3.5 w-3.5" aria-hidden />
              Manage your Super Admin account in Profile
            </Link>
          ) : null}
        </div>
      </div>

      {/* Filter & Search Bar */}
      {admins.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-700/45"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              aria-label="Search admin accounts"
              className="h-10 w-full rounded-full border border-sand-200 bg-white pl-10 pr-9 text-sm text-forest-950 placeholder:text-forest-700/45 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-forest-700/50 hover:bg-sand-100 hover:text-forest-950"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>

          <div
            className="flex items-center gap-1 rounded-full border border-sand-200 bg-white p-1"
            role="group"
            aria-label="Filter by status"
          >
            {(
              [
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "disabled", label: "Disabled" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                  statusFilter === tab.key
                    ? "bg-forest-700 text-cream"
                    : "text-forest-700 hover:bg-forest-50 hover:text-forest-950"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Admin Accounts List */}
      {admins.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center border-2 border-dashed border-sand-300 bg-white/70 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
            <UserPlus className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-4 font-serif text-lg font-semibold text-forest-950">
            No standard admin accounts yet
          </h2>
          <p className="mt-1 max-w-md text-sm text-forest-700/75">
            Click <strong className="font-semibold text-forest-950">“Add Admin”</strong> above to
            create a new team admin account.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface border border-sand-200 px-6 py-12 text-center">
          <p className="font-serif text-base font-semibold text-forest-950">
            No matching admin accounts
          </p>
          <p className="mt-1 text-sm text-forest-700/70">
            Try clearing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((admin) => (
            <AdminAccountCard
              key={admin.id}
              admin={admin}
              isSelf={admin.id === currentUserId}
              isOpen={openId === admin.id}
              onToggle={() => setOpenId((prev) => (prev === admin.id ? null : admin.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

