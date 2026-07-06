import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createBookingUseCase } from "@/features/booking/application/create-booking";
import { PrismaBookingRepository } from "@/features/booking/infrastructure/prisma-booking-repository";
import { createNotificationService } from "@/features/notification/application/notification-service";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";

describe("notification idempotency", () => {
  const email = "notify-idempotency@integration.test";
  let serviceId = "";

  beforeAll(async () => {
    await seedCatalog(prisma);
    serviceId = (
      await prisma.service.findUniqueOrThrow({ where: { slug: "photo-room-rental" } })
    ).id;
    await prisma.notificationLog.deleteMany({
      where: { booking: { customerEmail: email } },
    });
    await prisma.paymentEvent.deleteMany({
      where: { booking: { customerEmail: email } },
    });
    await prisma.payment.deleteMany({
      where: { booking: { customerEmail: email } },
    });
    await prisma.booking.deleteMany({ where: { customerEmail: email } });
  });

  afterAll(async () => {
    await prisma.notificationLog.deleteMany({
      where: { booking: { customerEmail: email } },
    });
    await prisma.paymentEvent.deleteMany({
      where: { booking: { customerEmail: email } },
    });
    await prisma.payment.deleteMany({
      where: { booking: { customerEmail: email } },
    });
    await prisma.booking.deleteMany({ where: { customerEmail: email } });
    await prisma.$disconnect();
  });

  it("writes a single notification log for duplicate causal event ids", async () => {
    const createBooking = createBookingUseCase({
      repository: new PrismaBookingRepository(prisma),
      now: () => new Date("2026-07-05T00:00:00.000Z"),
      tokenFactory: () => ({ rawToken: "raw", tokenHash: "hash" }),
    });
    const booking = await createBooking({
      serviceId,
      startTime: "2027-02-03T03:00:00.000Z",
      customerName: "Notify Test",
      customerEmail: email,
    });

    const service = createNotificationService({
      client: prisma,
      emailProvider: {
        send: async () => ({ providerReference: "provider-ref-1" }),
      },
    });
    const intent = {
      bookingId: booking.bookingId,
      eventType: "BOOKING_CREATED" as const,
      causalEventId: "cause-duplicate-1",
    };
    await service.sendBookingNotification(intent);
    await service.sendBookingNotification(intent);

    expect(
      await prisma.notificationLog.count({
        where: {
          bookingId: booking.bookingId,
          eventType: "BOOKING_CREATED",
          causalEventId: "cause-duplicate-1",
        },
      }),
    ).toBe(1);
  });
});
