"use server";

import { revalidatePath } from "next/cache";

import { claimGuestBookings } from "@/features/auth/application/claim-guest-bookings";
import { getCurrentActor } from "@/features/auth/application/current-actor";

export async function claimGuestBookingsAction() {
  const actor = await getCurrentActor();
  if (!actor) return { ok: false, message: "Vui lòng đăng nhập để nhận booking." } as const;
  try {
    const result = await claimGuestBookings(actor);
    revalidatePath("/account/bookings");
    return { ok: true, message: result.claimedCount > 0 ? `Đã nhận ${result.claimedCount} booking.` : "Không có booking mới để nhận." } as const;
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không thể nhận booking." } as const;
  }
}
