export type AppRole = "CUSTOMER" | "ADMIN";
export type BookingType = "ROOM_ONLY" | "ASSISTED";
export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED"
  | "COMPLETED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";
export type RefundStatus = "NONE" | "REQUESTED" | "PROCESSING" | "REFUNDED" | "REJECTED";

export type TransitionContext = Readonly<{
  actorRole: AppRole | null;
  bookingType: BookingType;
  cancellationAllowed: boolean;
  paymentStatus: PaymentStatus;
}>;
