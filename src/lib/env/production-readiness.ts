import { z } from "zod";

import { parseServerEnv } from "./server-schema";

const httpsUrl = z.url({ protocol: /^https$/ });

function assertProductionUrl(name: string, value: string | undefined): void {
  const parsed = httpsUrl.safeParse(value);
  if (!parsed.success || parsed.data.includes("localhost") || parsed.data.includes("127.0.0.1")) {
    throw new Error(`${name} must be a public HTTPS URL in production.`);
  }
}

function assertConfigured(name: string, value: string | undefined): void {
  if (!value?.trim() || /^(replace-|your-|example-|test-)/i.test(value.trim())) {
    throw new Error(`${name} must be configured for production.`);
  }
}

export function validateProductionReadiness(environment: Record<string, string | undefined>) {
  const parsed = parseServerEnv({ ...environment, VERCEL_ENV: "production" });
  const databaseUrl = new URL(parsed.DATABASE_URL);
  const directUrl = new URL(parsed.DIRECT_URL);

  assertProductionUrl("APP_URL", parsed.APP_URL);
  assertProductionUrl("NEXT_PUBLIC_SUPABASE_URL", parsed.NEXT_PUBLIC_SUPABASE_URL);

  if (!databaseUrl.hostname.includes("pooler.supabase.com")) {
    throw new Error("DATABASE_URL must use the Supabase pooler in production.");
  }
  if (directUrl.hostname.includes("pooler.supabase.com")) {
    throw new Error("DIRECT_URL must use the non-pooled Supabase database host.");
  }
  if (parsed.DATABASE_URL === parsed.DIRECT_URL) {
    throw new Error("DATABASE_URL and DIRECT_URL must use separate runtime and migration endpoints.");
  }
  assertConfigured("NEXT_PUBLIC_SUPABASE_ANON_KEY", parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  assertConfigured("SUPABASE_SERVICE_ROLE_KEY", parsed.SUPABASE_SERVICE_ROLE_KEY);
  if (parsed.PAYMENT_MODE === "sepay") {
    if ((parsed.SEPAY_WEBHOOK_SECRET?.length ?? 0) < 32) {
      throw new Error("SEPAY_WEBHOOK_SECRET must contain at least 32 characters.");
    }
    if (parsed.SEPAY_BANK_ACCOUNT === "0123456789") {
      throw new Error("SEPAY_BANK_ACCOUNT must not use the example account number.");
    }
  }
  if (!parsed.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required in production.");
  }
  if (parsed.NOTIFICATION_FROM_EMAIL.endsWith(".local")) {
    throw new Error("NOTIFICATION_FROM_EMAIL must use a verified public domain.");
  }
  assertProductionUrl("SENTRY_DSN", parsed.SENTRY_DSN);
  assertProductionUrl("NEXT_PUBLIC_SENTRY_DSN", parsed.NEXT_PUBLIC_SENTRY_DSN);
  if (parsed.SENTRY_ENVIRONMENT !== "production") {
    throw new Error('SENTRY_ENVIRONMENT must equal "production".');
  }
  assertConfigured("SENTRY_ORG", environment.SENTRY_ORG);
  assertConfigured("SENTRY_PROJECT", environment.SENTRY_PROJECT);
  assertConfigured("SENTRY_AUTH_TOKEN", environment.SENTRY_AUTH_TOKEN);
  if (environment.ALLOW_TEST_ACTOR === "true") {
    throw new Error("ALLOW_TEST_ACTOR must never be enabled in production.");
  }

  return parsed;
}
