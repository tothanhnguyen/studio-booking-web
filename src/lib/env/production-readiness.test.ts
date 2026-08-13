import { describe, expect, it } from "vitest";

import { validateProductionReadiness } from "./production-readiness";

const validProductionEnvironment = {
  DATABASE_URL: "postgresql://postgres.example:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
  DIRECT_URL: "postgresql://postgres:password@db.example.supabase.co:5432/postgres",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-for-production-contract",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key-for-production-contract",
  APP_URL: "https://mowstudio.example",
  SEPAY_WEBHOOK_SECRET: "a".repeat(32),
  SEPAY_BANK_ACCOUNT: "9876543210",
  RESEND_API_KEY: "resend-test-key",
  NOTIFICATION_FROM_EMAIL: "booking@mowstudio.example",
  SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
  NEXT_PUBLIC_SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
  SENTRY_ENVIRONMENT: "production",
  SENTRY_ORG: "mowstudio",
  SENTRY_PROJECT: "studio-booking-web",
  SENTRY_AUTH_TOKEN: "sentry-auth-token",
};

describe("production readiness", () => {
  it("accepts a complete production environment", () => {
    expect(validateProductionReadiness(validProductionEnvironment).APP_URL).toBe(
      "https://mowstudio.example",
    );
  });

  it("derives APP_URL from the Vercel deployment URL", () => {
    const environment = { ...validProductionEnvironment, APP_URL: undefined };

    expect(
      validateProductionReadiness({
        ...environment,
        VERCEL_URL: "mowstudio-preview.vercel.app",
      }).APP_URL,
    ).toBe("https://mowstudio-preview.vercel.app");
  });

  it("allows demo payment mode without SePay credentials", () => {
    const environment = {
      ...validProductionEnvironment,
      PAYMENT_MODE: "demo",
      SEPAY_WEBHOOK_SECRET: "",
      SEPAY_BANK_ACCOUNT: "0123456789",
    };

    expect(validateProductionReadiness(environment).PAYMENT_MODE).toBe("demo");
  });

  it.each([
    ["SEPAY_WEBHOOK_SECRET", ""],
    ["RESEND_API_KEY", ""],
    ["SENTRY_DSN", ""],
    ["NEXT_PUBLIC_SENTRY_DSN", ""],
    ["SENTRY_AUTH_TOKEN", ""],
  ])("rejects a missing %s", (key, value) => {
    expect(() =>
      validateProductionReadiness({ ...validProductionEnvironment, [key]: value }),
    ).toThrow(key);
  });

  it("rejects test actors in production", () => {
    expect(() =>
      validateProductionReadiness({
        ...validProductionEnvironment,
        ALLOW_TEST_ACTOR: "true",
      }),
    ).toThrow(/ALLOW_TEST_ACTOR/);
  });
});
