import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "pgm_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function parseBoolean(value: string | undefined): boolean | undefined {
  switch (value?.trim().toLowerCase()) {
    case "1":
    case "true":
    case "yes":
    case "on":
      return true;
    case "0":
    case "false":
    case "no":
    case "off":
      return false;
    default:
      return undefined;
  }
}

/**
 * Decide whether the session cookie must carry the `Secure` flag.
 *
 * Cookies marked `Secure` are silently dropped by browsers when the site is
 * served over plain HTTP, which makes a successful login redirect straight
 * back to the sign-in page. Deriving the flag from the actual request (rather
 * than `NODE_ENV` alone) keeps HTTP-only deployments usable while still
 * protecting cookies behind TLS.
 *
 * `AUTH_COOKIE_SECURE` can force the behaviour when running behind a proxy
 * that does not forward `X-Forwarded-Proto`.
 */
async function shouldUseSecureCookies(): Promise<boolean> {
  const override = parseBoolean(process.env.AUTH_COOKIE_SECURE);
  if (override !== undefined) return override;

  const forwardedProto = (await headers())
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  if (forwardedProto === "https") return true;
  if (forwardedProto === "http") return false;

  // No proxy information: assume production is served over HTTPS.
  return process.env.NODE_ENV === "production";
}

export async function createSession(userId: string): Promise<void> {
  const rawToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.adminSession.create({
    data: { userId, token: hashToken(rawToken), expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: await shouldUseSecureCookies(),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (rawToken) {
    await prisma.adminSession.deleteMany({ where: { token: hashToken(rawToken) } });
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const session = await prisma.adminSession.findUnique({
    where: { token: hashToken(rawToken) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;
  return session.user;
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

/**
 * Guard for admin-only server code (Server Actions, pages, route handlers).
 * Redirects unauthenticated users to /admin/login.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

/**
 * Guard used by public-facing server actions (e.g. contact forms)
 * that must never expose admin data to anonymous callers.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}