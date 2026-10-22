/**
 * Shared helpers for direct-contact links.
 *
 * Viber is the tricky one: personal Viber accounts have no web chat page
 * (viber.me only works for Viber Business accounts), so the only way to open
 * a chat with a chosen number is the app deep link.
 *
 * The `viber://chat/?number=%2B...` form (trailing slash, encoded plus) is the
 * variant that works on both Viber mobile and Viber Desktop. Without the slash
 * some desktop builds open the app but land on the chat list instead of the
 * selected number's conversation.
 */

export function normalizePhoneNumber(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "";

  // Myanmar local mobile numbers (09xxxxxxxxx) -> international (959xxxxxxxxx).
  // Only touch the local mobile pattern so foreign numbers are left untouched.
  if (/^09\d{7,9}$/.test(digits)) {
    return `95${digits.slice(1)}`;
  }

  return digits;
}

/** Deep link that opens Viber directly in a chat with the given number. */
export function viberHref(value: string | null | undefined): string | null {
  const digits = normalizePhoneNumber(value);
  return digits ? `viber://chat/?number=%2B${digits}` : null;
}

/** Public Telegram chat link (opens Telegram Web or the installed app). */
export function telegramHref(value: string | null | undefined): string | null {
  const username = (value ?? "").trim().replace(/^@+/, "");
  return username ? `https://t.me/${username}` : null;
}

/** WhatsApp click-to-chat link with an optional prefilled message. */
export function whatsappHref(
  value: string | null | undefined,
  message?: string
): string | null {
  const digits = normalizePhoneNumber(value);
  if (!digits) return null;

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}
