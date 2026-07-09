import { describe, expect, it } from "vitest";

import { redact } from "./redact";

describe("redact", () => {
  it("masks sensitive keys regardless of casing", () => {
    const input = {
      email: "khach@example.com",
      Phone: "0901234567",
      guestToken: "raw-secret-token",
      authorization: "Bearer abc",
      password: "hunter2",
      secret: "s3cr3t",
      signature: "sig",
      apiKey: "key",
      bankAccount: "0123456789",
    };

    expect(redact(input)).toEqual({
      email: "[redacted]",
      Phone: "[redacted]",
      guestToken: "[redacted]",
      authorization: "[redacted]",
      password: "[redacted]",
      secret: "[redacted]",
      signature: "[redacted]",
      apiKey: "[redacted]",
      bankAccount: "[redacted]",
    });
  });

  it("preserves safe fields", () => {
    const input = {
      requestId: "req-1",
      releaseSha: "abc123",
      module: "payment",
      bookingId: "booking-1",
      amount: 300_000,
    };

    expect(redact(input)).toEqual(input);
  });

  it("recurses into nested objects and arrays", () => {
    const input = {
      requestId: "req-1",
      customer: { email: "a@b.com", name: "safe" },
      events: [{ token: "t1" }, { bookingId: "b2" }],
    };

    expect(redact(input)).toEqual({
      requestId: "req-1",
      customer: { email: "[redacted]", name: "safe" },
      events: [{ token: "[redacted]" }, { bookingId: "b2" }],
    });
  });

  it("masks email and phone values found in free-text fields", () => {
    const input = {
      cause: "Failed for khach@example.com calling 0901234567",
    };

    const result = redact(input) as { cause: string };
    expect(result.cause).not.toContain("khach@example.com");
    expect(result.cause).not.toContain("0901234567");
    expect(result.cause).toContain("[redacted]");
  });

  it("masks credentials found in free-text error strings", () => {
    const input = {
      cause:
        "connect failed password=secret postgres://admin:raw-pass@db.example:5432/mowstudio token=abc123",
    };

    const result = redact(input) as { cause: string };
    expect(result.cause).not.toContain("password=secret");
    expect(result.cause).not.toContain("raw-pass");
    expect(result.cause).not.toContain("token=abc123");
    expect(result.cause).toContain("[redacted]");
  });

  it("masks database host details found in free-text error strings", () => {
    const input = {
      cause: "connect ETIMEDOUT 10.0.0.1:5432",
    };

    const result = redact(input) as { cause: string };
    expect(result.cause).not.toContain("10.0.0.1");
    expect(result.cause).not.toContain("5432");
    expect(result.cause).toContain("[redacted]");
  });

  it("returns primitives unchanged", () => {
    expect(redact(42)).toBe(42);
    expect(redact("safe text")).toBe("safe text");
    expect(redact(null)).toBeNull();
  });
});
