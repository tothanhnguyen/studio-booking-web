import type { BookingStatus, TransitionContext } from "./booking-types";

export function canTransitionBooking(
  from: BookingStatus,
  to: BookingStatus,
  context: TransitionContext,
): boolean {
  if (from === to) {
    return false;
  }

  if (from === "PENDING_PAYMENT") {
    if (to === "EXPIRED") {
      return context.paymentStatus !== "PAID";
    }

    if (to === "CONFIRMED") {
      return context.bookingType === "ROOM_ONLY" && context.paymentStatus === "PAID";
    }

    if (to === "PENDING") {
      return context.bookingType === "ASSISTED" && context.paymentStatus === "PAID";
    }

    if (to === "CANCELLED") {
      return context.actorRole === "ADMIN" || context.actorRole === "CUSTOMER";
    }

    return false;
  }

  if (from === "PENDING") {
    if (to === "CONFIRMED") {
      return context.bookingType === "ASSISTED" && context.actorRole === "ADMIN";
    }

    if (to === "CANCELLED") {
      return (
        context.actorRole === "ADMIN" ||
        (context.actorRole === "CUSTOMER" && context.cancellationAllowed)
      );
    }

    return false;
  }

  if (from === "CONFIRMED") {
    if (to === "COMPLETED") {
      return context.actorRole === "ADMIN";
    }

    if (to === "CANCELLED") {
      return (
        context.actorRole === "ADMIN" ||
        (context.actorRole === "CUSTOMER" && context.cancellationAllowed)
      );
    }
  }

  return false;
}
