import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing helpers.
 *
 * New hashes use scrypt with a random per-user salt. Legacy unsalted SHA-256
 * hashes (from the original seed) are still accepted so existing database
 * users can sign in; `isLegacyPasswordHash` lets the login action transparently
 * upgrade them to scrypt on the next successful sign-in.
 */

const SCRYPT_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${SCRYPT_PREFIX}:${salt}:${derived}`;
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function isLegacyPasswordHash(stored: string): boolean {
  return /^[a-f0-9]{64}$/i.test(stored);
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;

  const [scheme, salt, hash] = stored.split(":");
  if (scheme === SCRYPT_PREFIX && salt && hash) {
    try {
      const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
      const expected = Buffer.from(hash, "hex");
      return derived.length === expected.length && timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }

  // Backwards compatibility with hashes created before scrypt was introduced.
  if (isLegacyPasswordHash(stored)) {
    return safeEqualHex(createHash("sha256").update(password).digest("hex"), stored);
  }

  return false;
}
