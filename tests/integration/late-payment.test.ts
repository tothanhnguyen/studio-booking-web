import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { POST } from "@/app/api/payments/sepay/webhook/route";
import { PrismaBookingRepository } from "@/features/booking/infrastructure/prisma-booking-repository";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";
import { signedWebhookHeaders } from "../fixtures/sepay-signature";

describe("late payment handling", () => {
  const bookingRepository = new PrismaBookingRepository(prisma);
  const email = "late-payment@integration.test";
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

  it("keeps expired booking out of confirmation and marks refund requested", async () => {
    const created = await bookingRepository.createHold(
      {
        serviceId,
        startTime: "2027-02-02T03:00:00.000Z",
        customerName: "Late Payment Test",
        customerEmail: email,
      },
      "hash-late",
      new Date("2026-07-05T00:00:00.000Z"),
    );
    const bookingId = created.bookingId;
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: "EXPIRED",
        holdExpiresAt: new Date("2026-07-05T00:05:00.000Z"),
      },
    });

    const rawBody = JSON.stringify({
      id: "evt-late-payment-1",
      amount: 240000,
      currency: "VND",
      content: `Thanh toan coc BOOKING:${bookingId}`,
      occurred_at: "2026-07-06T01:05:00.000Z",
    });
    const response = await POST(
      new Request("http://localhost/api/payments/sepay/webhook", {
        method: "POST",
        headers: signedWebhookHeaders(rawBody),
        body: rawBody,
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { status: "PROCESSED", decision: "SETTLED", latePaymentReview: true },
    });

    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      select: { bookingStatus: true, paymentStatus: true, refundStatus: true },
    });
    expect(booking).toMatchObject({
      bookingStatus: "EXPIRED",
      paymentStatus: "PAID",
      refundStatus: "REQUESTED",
    });
  });
});
