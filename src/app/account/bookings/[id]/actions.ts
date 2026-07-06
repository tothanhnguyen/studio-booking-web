"use server";

import { revalidatePath } from "next/cache";

import { getCurrentActor } from "@/features/auth/application/current-actor";
import { cancelBooking } from "@/features/booking/application/cancel-booking";

export async function cancelOwnBookingAction(bookingId: string, reason: string) {
  await cancelBooking(await getCurrentActor(), bookingId, reason);
  revalidatePath(`/account/bookings/${bookingId}`);
  revalidatePath("/account/bookings");
}
