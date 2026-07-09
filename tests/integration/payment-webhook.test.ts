import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { POST } from "@/app/api/payments/sepay/webhook/route";
import { PrismaBookingRepository } from "@/features/booking/infrastructure/prisma-booking-repository";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";
import { signedWebhookHeaders } from "../fixtures/sepay-signature";

describe("payment webhook processing", () => {
  const bookingRepository = new PrismaBookingRepository(prisma);
  const email = "payment-webhook@integration.test";
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

  it("processes room-only payment once and ignores duplicate event replay", async () => {
    const created = await bookingRepository.createHold(
      {
        serviceId,
        startTime: "2027-02-01T03:00:00.000Z",
        customerName: "Webhook Test",
        customerEmail: email,
      },
      "hash-room-only",
      new Date("2026-07-05T00:00:00.000Z"),
    );
    const bookingId = created.bookingId;
    const eventBody = {
      id: "evt-payment-webhook-1",
      amount: 240000,
      currency: "VND",
      content: `Thanh toan coc BOOKING:${bookingId}`,
      occurred_at: "2026-07-06T01:00:00.000Z",
    };

    const rawBody = JSON.stringify(eventBody);
    const first = await POST(
      new Request("http://localhost/api/payments/sepay/webhook", {
        method: "POST",
        headers: signedWebhookHeaders(rawBody),
        body: rawBody,
      }),
    );
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({
      data: { status: "PROCESSED", decision: "SETTLED" },
    });

    const duplicate = await POST(
      new Request("http://localhost/api/payments/sepay/webhook", {
        method: "POST",
        headers: signedWebhookHeaders(rawBody),
        body: rawBody,
      }),
    );
    expect(duplicate.status).toBe(200);
    await expect(duplicate.json()).resolves.toMatchObject({
      data: { status: "DUPLICATE", decision: null },
    });

    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      select: { bookingStatus: true, paymentStatus: true, refundStatus: true },
    });
    expect(booking).toMatchObject({
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      refundStatus: "NONE",
    });
    expect(
      await prisma.paymentEvent.count({
        where: { provider: "SEPAY", eventId: "evt-payment-webhook-1" },
      }),
    ).toBe(1);
  });
});
