import { fromZonedTime } from "date-fns-tz";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AvailabilityData, AvailabilitySource } from "@/features/availability/application/get-available-slots";

function nextDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day! + 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

export class PrismaAvailabilitySource implements AvailabilitySource {
  constructor(private readonly client: PrismaClient) {}

  async load({ serviceId, date }: { serviceId: string; date: string }): Promise<AvailabilityData> {
    const service = await this.client.service.findFirst({
      where: { id: serviceId, isActive: true, room: { isActive: true } },
      select: { id: true, roomId: true, durationMinutes: true, bufferMinutes: true },
    });
    if (!service) return { service: null, workingWindows: [], blockedRanges: [], bookings: [] };
    const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    const dayStart = fromZonedTime(`${date}T00:00:00`, "Asia/Ho_Chi_Minh");
    const dayEnd = fromZonedTime(`${nextDate(date)}T00:00:00`, "Asia/Ho_Chi_Minh");
    const [hours, blocked, bookings] = await Promise.all([
      this.client.workingHour.findMany({ where: { roomId: service.roomId, weekday, isActive: true }, orderBy: { openMinute: "asc" }, select: { openMinute: true, closeMinute: true } }),
      this.client.blockedSlot.findMany({ where: { roomId: service.roomId, startTime: { lt: dayEnd }, endTime: { gt: dayStart } }, select: { startTime: true, endTime: true } }),
      this.client.booking.findMany({ where: { roomId: service.roomId, startTime: { lt: dayEnd }, bufferEndTime: { gt: dayStart } }, select: { startTime: true, bufferEndTime: true, bookingStatus: true, holdExpiresAt: true } }),
    ]);
    return {
      service,
      workingWindows: hours,
      blockedRanges: blocked.map((range) => ({ startTime: range.startTime.toISOString(), endTime: range.endTime.toISOString() })),
      bookings: bookings.map((booking) => ({ startTime: booking.startTime.toISOString(), endTime: booking.bufferEndTime.toISOString(), bookingStatus: booking.bookingStatus, holdExpiresAt: booking.holdExpiresAt?.toISOString() ?? null })),
    };
  }
}
