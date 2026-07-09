const SENSITIVE_KEY_PATTERN =
  /(email|phone|token|authorization|password|secret|signature|apikey|api_key|credential|bank|account|webhook)/i;

const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const PHONE_PATTERN = /(?<!\d)(?:\+?84|0)\d{8,10}(?!\d)/g;
const CREDENTIAL_URL_PATTERN = /\b([a-z][a-z0-9+.-]*:\/\/)([^:\s/@]+):([^@\s]+)@/gi;
const POSTGRES_URL_PATTERN = /\bpostgres(?:ql)?:\/\/[^\s]+/gi;
const IP_PORT_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}:\d{2,5}\b/g;
const SECRET_ASSIGNMENT_PATTERN =
  /\b(password|pass|pwd|token|access_token|refresh_token|secret|api[_-]?key)=([^\s&]+)/gi;

const REDACTED = "[redacted]";

function maskFreeText(value: string): string {
  return value
    .replace(POSTGRES_URL_PATTERN, REDACTED)
    .replace(CREDENTIAL_URL_PATTERN, `$1${REDACTED}@`)
    .replace(IP_PORT_PATTERN, REDACTED)
    .replace(SECRET_ASSIGNMENT_PATTERN, `$1=${REDACTED}`)
    .replace(EMAIL_PATTERN, REDACTED)
    .replace(PHONE_PATTERN, REDACTED);
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
