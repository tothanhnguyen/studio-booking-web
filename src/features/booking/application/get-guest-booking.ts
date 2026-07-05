import { guestTokenMatches } from "@/lib/security/guest-token";

export type GuestBookingView = Readonly<{
  id: string; serviceName: string; roomName: string; startTime: string; endTime: string;
  holdExpiresAt: string | null; depositAmount: number; remainingAmount: number; currency: string; bookingStatus: string;
}>;
type GuestBookingRecord = GuestBookingView & Readonly<{ guestAccessTokenHash: string | null }>;
export interface GuestBookingRepository { findGuestBooking(id: string): Promise<GuestBookingRecord | null>; }

export function createGetGuestBooking(repository: GuestBookingRepository) {
  return async function getGuestBooking(id: string, rawToken: string): Promise<GuestBookingView | null> {
    const booking = await repository.findGuestBooking(id);
    if (!booking?.guestAccessTokenHash || !guestTokenMatches(rawToken, booking.guestAccessTokenHash)) return null;
    return {
      id: booking.id, serviceName: booking.serviceName, roomName: booking.roomName,
      startTime: booking.startTime, endTime: booking.endTime, holdExpiresAt: booking.holdExpiresAt,
      depositAmount: booking.depositAmount, remainingAmount: booking.remainingAmount,
      currency: booking.currency, bookingStatus: booking.bookingStatus,
    };
  };
}

export async function getGuestBooking(id: string, rawToken: string) {
  const [{ PrismaBookingRepository }, { prisma }] = await Promise.all([
    import("@/features/booking/infrastructure/prisma-booking-repository"), import("@/lib/db/prisma"),
  ]);
  return createGetGuestBooking(new PrismaBookingRepository(prisma))(id, rawToken);
}
