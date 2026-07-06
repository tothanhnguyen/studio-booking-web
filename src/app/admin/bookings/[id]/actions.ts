"use server";

import { revalidatePath } from "next/cache";

import { getCurrentActor } from "@/features/auth/application/current-actor";
import { cancelBooking } from "@/features/booking/application/cancel-booking";
import {
  confirmAssistedBooking,
  rejectAssistedBooking,
} from "@/features/booking/application/confirm-assisted-booking";
import { updateRefundStatus } from "@/features/payment/application/update-refund-status";
import type { RefundStatus } from "@/generated/prisma/client";

const refundStatuses = new Set<RefundStatus>([
  "REQUESTED",
  "PROCESSING",
  "REFUNDED",
  "REJECTED",
]);

export async function confirmAssistedBookingAction(bookingId: string) {
  await confirmAssistedBooking(await getCurrentActor(), bookingId);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}

export async function rejectAssistedBookingAction(bookingId: string, reason: string) {
  await rejectAssistedBooking(await getCurrentActor(), bookingId, reason);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}

export async function cancelBookingByAdminAction(bookingId: string, reason: string) {
  await cancelBooking(await getCurrentActor(), bookingId, reason);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}

export async function updateRefundStatusAction(
  bookingId: string,
  status: string,
  note: string,
) {
  if (!refundStatuses.has(status as RefundStatus)) {
    throw new Error("Refund status không hợp lệ.");
  }
  await updateRefundStatus(await getCurrentActor(), bookingId, status as RefundStatus, note);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/payments");
}
