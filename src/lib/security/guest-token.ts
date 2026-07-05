import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function hashGuestToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function createGuestToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("base64url");
  return { rawToken, tokenHash: hashGuestToken(rawToken) };
}

export function guestTokenMatches(rawToken: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashGuestToken(rawToken), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
