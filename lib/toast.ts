import { cookies } from "next/headers";

export type ToastType = "success" | "error" | "info";

export type ToastMessage = {
  type: ToastType;
  text: string;
  nonce: number;
};

export const TOAST_COOKIE = "pgm_admin_toast";

const TOAST_TTL_S = 30;

/** Set a flash toast cookie. Call from Server Actions before redirect/refresh. */
export async function flashAdminToast(message: Omit<ToastMessage, "nonce">) {
  const cookieStore = await cookies();
  cookieStore.set(TOAST_COOKIE, JSON.stringify({ ...message, nonce: Date.now() }), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: TOAST_TTL_S,
  });
}

/** Read the flash toast cookie from a Server Component render. */
export async function getAdminToast(): Promise<ToastMessage | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TOAST_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ToastMessage>;
    if (parsed && typeof parsed.nonce === "number" && typeof parsed.text === "string") {
      return parsed as ToastMessage;
    }
  } catch {
    // malformed cookie — ignore
  }
  return null;
}