import { describe, expect, it } from "vitest";

import { canTransitionBooking } from "./booking-policy";
import type { BookingStatus, TransitionContext } from "./booking-types";

function context(overrides: Partial<TransitionContext> = {}): TransitionContext {
  return {
    actorRole: null,
    bookingType: "ROOM_ONLY",
    cancellationAllowed: false,
    paymentStatus: "PENDING",
    ...overrides,
  };
}

describe("booking transition policy", () => {
  it.each([
    ["PENDING_PAYMENT", "EXPIRED", context()],
    ["PENDING_PAYMENT", "CONFIRMED", context({ paymentStatus: "PAID" })],
    [
      "PENDING_PAYMENT",
      "PENDING",
      context({ bookingType: "ASSISTED", paymentStatus: "PAID" }),
    ],
    ["PENDING", "CONFIRMED", context({ actorRole: "ADMIN", bookingType: "ASSISTED" })],
    ["PENDING", "CANCELLED", context({ actorRole: "ADMIN", bookingType: "ASSISTED" })],
    ["CONFIRMED", "COMPLETED", context({ actorRole: "ADMIN" })],
    [
      "CONFIRMED",
      "CANCELLED",
      context({ actorRole: "CUSTOMER", cancellationAllowed: true }),
    ],
  ] satisfies Array<[BookingStatus, BookingStatus, TransitionContext]>) (
    "allows %s → %s when its invariant is satisfied",
    (from, to, transitionContext) => {
      expect(canTransitionBooking(from, to, transitionContext)).toBe(true);
    },
  );

  it.each([
    ["PENDING_PAYMENT", "CONFIRMED", context({ paymentStatus: "PENDING" })],
    [
      "PENDING_PAYMENT",
      "CONFIRMED",
      context({ bookingType: "ASSISTED", paymentStatus: "PAID" }),
    ],
    ["PENDING", "CONFIRMED", context({ actorRole: "CUSTOMER", bookingType: "ASSISTED" })],
    [
      "CONFIRMED",
      "CANCELLED",
      context({ actorRole: "CUSTOMER", cancellationAllowed: false }),
    ],
    ["CONFIRMED", "PENDING", context({ actorRole: "ADMIN" })],
    ["CANCELLED", "CONFIRMED", context({ actorRole: "ADMIN", paymentStatus: "PAID" })],
    ["EXPIRED", "EXPIRED", context()],
    ["COMPLETED", "CANCELLED", context({ actorRole: "ADMIN" })],
  ] satisfies Array<[BookingStatus, BookingStatus, TransitionContext]>) (
    "rejects %s → %s when an invariant is not satisfied",
    (from, to, transitionContext) => {
      expect(canTransitionBooking(from, to, transitionContext)).toBe(false);
    },
  );
});
