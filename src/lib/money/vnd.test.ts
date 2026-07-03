import { describe, expect, it } from "vitest";

import { calculateDeposit } from "./vnd";

describe("calculateDeposit", () => {
  it.each([
    { subtotal: 1_000_000, deposit: 300_000, remaining: 700_000 },
    { subtotal: 1_000_001, deposit: 300_000, remaining: 700_001 },
    { subtotal: 2, deposit: 1, remaining: 1 },
    { subtotal: 0, deposit: 0, remaining: 0 },
  ])("calculates a rounded 30% VND deposit for $subtotal", ({ subtotal, deposit, remaining }) => {
    expect(calculateDeposit(subtotal)).toEqual({
      depositAmount: deposit,
      remainingAmount: remaining,
    });
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid integer VND amount %s",
    (subtotal) => {
      expect(() => calculateDeposit(subtotal)).toThrow("subtotalAmount");
    },
  );
});
