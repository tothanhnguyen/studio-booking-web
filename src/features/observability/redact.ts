const SENSITIVE_KEY_PATTERN =
  /(email|phone|token|authorization|password|secret|signature|apikey|api_key|credential|bank|account|webhook)/i;

const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const PHONE_PATTERN = /(?<!\d)(?:\+?84|0)\d{8,10}(?!\d)/g;

const REDACTED = "[redacted]";

function maskFreeText(value: string): string {
  return value.replace(EMAIL_PATTERN, REDACTED).replace(PHONE_PATTERN, REDACTED);
}

/**
 * Recursively redacts PII/secret values so log fields and error causes never
 * leak email, phone, tokens, credentials or provider payloads.
 */
export function redact(value: unknown): unknown {
  if (typeof value === "string") return maskFreeText(value);
  if (value === null || typeof value !== "object") return value;

  if (Array.isArray(value)) return value.map((item) => redact(item));

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    result[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redact(entry);
  }
  return result;
}
