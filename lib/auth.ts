import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "pgm_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
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
    secure: process.env.NODE_ENV === "production",
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