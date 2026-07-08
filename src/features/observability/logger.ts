import { redact } from "./redact";
import { getRequestId } from "./request-context";

type LogLevel = "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

function releaseSha(): string | undefined {
  return process.env.NEXT_PUBLIC_RELEASE_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA;
}

function write(level: LogLevel, event: string, fields: LogFields): void {
  const entry: Record<string, unknown> = {
    level,
    event,
    time: new Date().toISOString(),
    ...(redact(fields) as LogFields),
  };

  const requestId = getRequestId();
  if (requestId) entry.requestId = requestId;

  const sha = releaseSha();
  if (sha) entry.releaseSha = sha;

  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

/**
 * Structured JSON logger. Fields are recursively redacted before emission so no
 * PII, token, credential or provider payload can reach stdout or log sinks.
 */
export const logger = {
  info: (event: string, fields: LogFields = {}) => write("info", event, fields),
  warn: (event: string, fields: LogFields = {}) => write("warn", event, fields),
  error: (event: string, fields: LogFields = {}) => write("error", event, fields),
};
