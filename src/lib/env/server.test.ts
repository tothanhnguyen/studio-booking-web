import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const validEnvironment = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:54329/mowstudio_test",
  DIRECT_URL: "postgresql://postgres:postgres@localhost:54329/mowstudio_test",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  APP_URL: "http://localhost:3000",
};

describe("server environment", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a missing DATABASE_URL without exposing other values", async () => {
    const environmentWithoutDatabaseUrl = Object.fromEntries(
      Object.entries(validEnvironment).filter(([key]) => key !== "DATABASE_URL"),
    );

    for (const [key, value] of Object.entries(environmentWithoutDatabaseUrl)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv("DATABASE_URL", "");

    await expect(import("./server")).rejects.toThrow(/DATABASE_URL/);
  });

  it("accepts syntactically valid required values", async () => {
    for (const [key, value] of Object.entries(validEnvironment)) {
      vi.stubEnv(key, value);
    }

    const { serverEnv } = await import("./server");

    expect(serverEnv.DATABASE_URL).toBe(validEnvironment.DATABASE_URL);
    expect(serverEnv.APP_URL).toBe("http://localhost:3000");
  });
});
