import { formatInTimeZone } from "date-fns-tz";

import type { PrismaClient } from "@/generated/prisma/client";
import type { BookingCommandRepository, CreateBookingCommand, PersistedBookingHold } from "@/features/booking/application/booking-command";
import type { GuestBookingRepository } from "@/features/booking/application/get-guest-booking";
import { withRoomDateLock } from "@/features/booking/infrastructure/booking-lock";
import { calculateDeposit } from "@/lib/money/vnd";

const MINUTE_MS = 60_000;

export class BookingConflictError extends Error {
  constructor(message = "Khung giờ vừa được người khác chọn.") { super(message); this.name = "BookingConflictError"; }
}

export class InvalidBookingSlotError extends Error {
  constructor(message: string) { super(message); this.name = "InvalidBookingSlotError"; }
}

export class PrismaBookingRepository implements BookingCommandRepository, GuestBookingRepository {
  constructor(private readonly client: PrismaClient) {}

  async claimUnownedByVerifiedEmail(userId: string, normalizedEmail: string): Promise<number> {
    const result = await this.client.booking.updateMany({
      where: { userId: null, customerEmail: { equals: normalizedEmail, mode: "insensitive" } },
      data: { userId },
    });
    return result.count;
  }

  async findGuestBooking(id: string) {
    const booking = await this.client.booking.findUnique({ where: { id }, select: {
      id: true, serviceName: true, roomName: true, startTime: true, endTime: true,
      holdExpiresAt: true, depositAmount: true, remainingAmount: true, currency: true,
      bookingStatus: true, guestAccessTokenHash: true,
    } });
    return booking ? { ...booking, startTime: booking.startTime.toISOString(), endTime: booking.endTime.toISOString(), holdExpiresAt: booking.holdExpiresAt?.toISOString() ?? null } : null;
  }

  async createHold(command: CreateBookingCommand, guestTokenHash: string, now: Date): Promise<PersistedBookingHold> {
    const service = await this.client.service.findFirst({
      where: { id: command.serviceId, isActive: true, room: { isActive: true } },
      include: { room: true },
    });
    if (!service) throw new InvalidBookingSlotError("Dịch vụ không tồn tại hoặc đang tạm ngưng.");
    const startTime = new Date(command.startTime);
    if (startTime <= now) throw new InvalidBookingSlotError("Giờ bắt đầu phải ở tương lai.");
    const minute = Number(formatInTimeZone(startTime, service.room.timezone, "m"));
    if (minute % 15 !== 0) throw new InvalidBookingSlotError("Giờ bắt đầu phải theo lưới 15 phút.");
    const endTime = new Date(startTime.getTime() + service.durationMinutes * MINUTE_MS);
    const bufferEndTime = new Date(endTime.getTime() + service.bufferMinutes * MINUTE_MS);
    const localDate = formatInTimeZone(startTime, service.room.timezone, "yyyy-MM-dd");
    const weekday = new Date(`${localDate}T00:00:00.000Z`).getUTCDay();
    const startMinute = Number(formatInTimeZone(startTime, service.room.timezone, "H")) * 60 + minute;
    const endMinute = startMinute + service.durationMinutes + service.bufferMinutes;
    const holdExpiresAt = new Date(now.getTime() + 10 * MINUTE_MS);
    const { depositAmount, remainingAmount } = calculateDeposit(service.priceAmount);

    return this.client.$transaction(async (tx) => withRoomDateLock(tx, service.roomId, localDate, async () => {
      const workingWindow = await tx.workingHour.findFirst({ where: {
        roomId: service.roomId, weekday, isActive: true,
        openMinute: { lte: startMinute }, closeMinute: { gte: endMinute },
      } });
      if (!workingWindow) throw new InvalidBookingSlotError("Khung giờ nằm ngoài giờ làm việc.");
      const blocked = await tx.blockedSlot.findFirst({ where: {
        roomId: service.roomId, startTime: { lt: bufferEndTime }, endTime: { gt: startTime },
      } });
      if (blocked) throw new BookingConflictError("Khung giờ đã bị studio chặn.");
      const overlap = await tx.booking.findFirst({ where: {
        roomId: service.roomId, startTime: { lt: bufferEndTime }, bufferEndTime: { gt: startTime },
        OR: [
          { bookingStatus: { in: ["PENDING", "CONFIRMED"] } },
          { bookingStatus: "PENDING_PAYMENT", holdExpiresAt: { gt: now } },
        ],
      } });
      if (overlap) throw new BookingConflictError();

      const booking = await tx.booking.create({ data: {
        roomId: service.roomId, serviceId: service.id,
        roomName: service.room.name, serviceName: service.name, bookingType: service.bookingType,
        customerName: command.customerName, customerEmail: command.customerEmail,
        customerPhone: command.customerPhone, note: command.note,
        startTime, endTime, bufferEndTime, holdExpiresAt,
        subtotalAmount: service.priceAmount, depositAmount, remainingAmount,
        currency: service.currency, bookingStatus: "PENDING_PAYMENT", paymentStatus: "PENDING",
        guestAccessTokenHash: guestTokenHash,
      } });
      await tx.payment.create({ data: {
        bookingId: booking.id, provider: "SEPAY", idempotencyKey: `booking:${booking.id}`,
        providerReference: booking.id,
        requestedAmount: depositAmount, currency: service.currency, status: "PENDING",
      } });
      return { bookingId: booking.id, holdExpiresAt: holdExpiresAt.toISOString() };
    }));
  }
}
