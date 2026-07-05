"use server";

import { cookies } from "next/headers";

import { createBooking } from "@/features/booking/application/create-booking";
import { guestCookieName } from "@/features/booking/application/guest-cookie";
import { BookingConflictError, InvalidBookingSlotError } from "@/features/booking/infrastructure/prisma-booking-repository";

export async function createBookingAction(input: unknown) {
  try {
    const created = await createBooking(input);
    (await cookies()).set(guestCookieName(created.bookingId), created.guestToken, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
      path: `/booking/${created.bookingId}`, expires: new Date(created.holdExpiresAt),
    });
    return { ok: true, data: { bookingId: created.bookingId, holdExpiresAt: created.holdExpiresAt } } as const;
  } catch (error) {
    if (error instanceof BookingConflictError || error instanceof InvalidBookingSlotError) return { ok: false, message: error.message } as const;
    return { ok: false, message: "Không thể giữ chỗ. Vui lòng kiểm tra thông tin và thử lại." } as const;
  }
}
