import type { AvailableSlot, TimeRange, WorkingWindow } from "@/features/availability/application/availability-types";
import { generateAvailableSlots } from "@/features/availability/domain/generate-slots";

type AvailabilityService = Readonly<{ id: string; roomId: string; durationMinutes: number; bufferMinutes: number }>;
type AvailabilityBooking = TimeRange & Readonly<{ bookingStatus: string; holdExpiresAt: string | null }>;
export type AvailabilityData = Readonly<{ service: AvailabilityService | null; workingWindows: WorkingWindow[]; blockedRanges: TimeRange[]; bookings: AvailabilityBooking[] }>;
export interface AvailabilitySource { load(input: { serviceId: string; date: string }): Promise<AvailabilityData>; }

export class ServiceUnavailableError extends Error {
  constructor() { super("Dịch vụ không tồn tại hoặc đang tạm ngưng."); this.name = "ServiceUnavailableError"; }
}

export function createGetAvailableSlots(source: AvailabilitySource) {
  return async function getAvailableSlots(input: { serviceId: string; date: string; now: string }): Promise<AvailableSlot[]> {
    const data = await source.load({ serviceId: input.serviceId, date: input.date });
    if (!data.service) throw new ServiceUnavailableError();
    const now = Date.parse(input.now);
    const bookingRanges = data.bookings.filter((booking) =>
      booking.bookingStatus === "PENDING" || booking.bookingStatus === "CONFIRMED" ||
      (booking.bookingStatus === "PENDING_PAYMENT" && booking.holdExpiresAt !== null && Date.parse(booking.holdExpiresAt) > now),
    ).map(({ startTime, endTime }) => ({ startTime, endTime }));

    return generateAvailableSlots({
      date: input.date, timezone: "Asia/Ho_Chi_Minh",
      workingWindows: data.workingWindows,
      durationMinutes: data.service.durationMinutes,
      bufferMinutes: data.service.bufferMinutes,
      blockedRanges: data.blockedRanges,
      bookingRanges,
      now: input.now,
    });
  };
}

export async function getAvailableSlots(input: { serviceId: string; date: string; now: string }) {
  const [{ PrismaAvailabilitySource }, { prisma }] = await Promise.all([
    import("@/features/availability/infrastructure/prisma-availability-source"), import("@/lib/db/prisma"),
  ]);
  return createGetAvailableSlots(new PrismaAvailabilitySource(prisma))(input);
}
