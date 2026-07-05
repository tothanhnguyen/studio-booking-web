import type { Actor } from "@/features/auth/application/current-actor";

export interface GuestClaimRepository { claimUnownedByVerifiedEmail(userId: string, normalizedEmail: string): Promise<number>; }

export class UnverifiedClaimError extends Error {
  constructor() { super("Cần tài khoản có email đã xác minh để nhận booking."); this.name = "UnverifiedClaimError"; }
}

export function createClaimGuestBookings(repository: GuestClaimRepository) {
  return async function claimGuestBookings(actor: Actor) {
    if (!actor.emailVerified || !actor.email) throw new UnverifiedClaimError();
    const claimedCount = await repository.claimUnownedByVerifiedEmail(actor.id, actor.email.trim().toLowerCase());
    return { claimedCount };
  };
}

export async function claimGuestBookings(actor: Actor) {
  const [{ PrismaBookingRepository }, { prisma }] = await Promise.all([
    import("@/features/booking/infrastructure/prisma-booking-repository"), import("@/lib/db/prisma"),
  ]);
  return createClaimGuestBookings(new PrismaBookingRepository(prisma))(actor);
}
