import { createHmac } from "node:crypto";

/**
 * Signs a SePay webhook body with the same HMAC-SHA256 scheme the provider
 * verifies (`verifySepaySignature`). Returns request headers including the
 * signature when a secret is configured; when no secret is set (local dev,
 * where the provider bypasses verification) only the content-type is returned.
 */
export function signedWebhookHeaders(rawBody: string): Record<string, string> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  const secret = process.env.SEPAY_WEBHOOK_SECRET?.trim();
  if (secret) {
    headers["x-sepay-signature"] = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  }
  return headers;
}
