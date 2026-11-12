"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, KeyRound, Mail, User } from "lucide-react";
import {
  changeMyPassword,
  updateMyProfile,
  type AdminActionState,
} from "@/lib/actions/admin";
import { SubmitButton } from "@/components/admin/submit-button";
import { PasswordInput } from "@/components/admin/password-input";
import { useToast } from "@/components/admin/toast";

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

export function ProfileInfoForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const { pushToast } = useToast();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [savedBanner, setSavedBanner] = useState(false);

  const [state, formAction] = useActionState<AdminActionState, FormData>(
    async (prev, formData) => {
      const result = await updateMyProfile(prev, formData);
      if (result.ok) {
        setSavedBanner(true);
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
    if (!savedBanner) return;
    const timer = window.setTimeout(() => setSavedBanner(false), 3500);
    return () => window.clearTimeout(timer);
  }, [savedBanner]);

  return (
    <form
      action={formAction}
      className="card-surface flex flex-col justify-between border border-sand-200/80 p-6 shadow-sm"
    >
      <div>
        <div className="flex items-center gap-3 border-b border-sand-200/80 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
            <User className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-forest-950">
              Account Details
            </h2>
            <p className="text-xs text-forest-700/70">
              Your display name and sign-in email address
            </p>
          </div>
        </div>

        {!state.ok && state.error ? (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-soil-300 bg-soil-50 px-3.5 py-2.5 text-xs font-medium text-soil-900"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-soil-700" aria-hidden />
            <span>{state.error}</span>
          </div>
        ) : null}

        {savedBanner ? (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2.5 text-xs font-semibold text-forest-800"
          >
            <Check className="h-4 w-4 text-forest-600" aria-hidden />
            Profile details saved!
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-forest-900">
              Full Name *
            </label>
            <input
              id="profile-name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aung Kyaw"
              className="input-admin"
            />
            <FieldError fieldErrors={state.fieldErrors} name="name" />
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-forest-900">
              <Mail className="h-4 w-4 text-forest-600" aria-hidden />
              Email Address *
            </label>
            <input
              id="profile-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@pgm-trading.com"
              className="input-admin"
            />
            <p className="mt-1 text-xs text-forest-700/65">
              Used to sign in to the admin panel and shown as article author.
            </p>
            <FieldError fieldErrors={state.fieldErrors} name="email" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end border-t border-sand-200/80 pt-4">
        <SubmitButton variant="primary" pendingText="Saving profile…">
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          <span>Save Details</span>
        </SubmitButton>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const { pushToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [savedBanner, setSavedBanner] = useState(false);

  const [state, formAction] = useActionState<AdminActionState, FormData>(
    async (prev, formData) => {
      const result = await changeMyPassword(prev, formData);
      if (result.ok) {
        formRef.current?.reset();
        setSavedBanner(true);
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
    if (!savedBanner) return;
    const timer = window.setTimeout(() => setSavedBanner(false), 3500);
    return () => window.clearTimeout(timer);
  }, [savedBanner]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="card-surface flex flex-col justify-between border border-sand-200/80 p-6 shadow-sm"
    >
      <div>
        <div className="flex items-center gap-3 border-b border-sand-200/80 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
            <KeyRound className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-forest-950">
              Change Password
            </h2>
            <p className="text-xs text-forest-700/70">
              Update your login password and sign out other devices
            </p>
          </div>
        </div>

        {!state.ok && state.error ? (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-soil-300 bg-soil-50 px-3.5 py-2.5 text-xs font-medium text-soil-900"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-soil-700" aria-hidden />
            <span>{state.error}</span>
          </div>
        ) : null}

        {savedBanner ? (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2.5 text-xs font-semibold text-forest-800"
          >
            <Check className="h-4 w-4 text-forest-600" aria-hidden />
            Password updated! Other sessions were signed out.
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-forest-900">
              Current Password *
            </label>
            <PasswordInput
              id="current-password"
              name="currentPassword"
              required
              autoComplete="current-password"
              placeholder="Enter current password"
            />
            <FieldError fieldErrors={state.fieldErrors} name="currentPassword" />
          </div>

          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-forest-900">
              New Password *
            </label>
            <PasswordInput
              id="new-password"
              name="newPassword"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
            <FieldError fieldErrors={state.fieldErrors} name="newPassword" />
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-forest-900">
              Confirm New Password *
            </label>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Re-enter new password"
            />
            <FieldError fieldErrors={state.fieldErrors} name="confirmPassword" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end border-t border-sand-200/80 pt-4">
        <SubmitButton variant="gold" pendingText="Updating password…">
          <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
          <span>Update Password</span>
        </SubmitButton>
      </div>
    </form>
  );
}

