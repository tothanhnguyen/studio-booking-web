import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { BookingConflictError, PrismaBookingRepository } from "@/features/booking/infrastructure/prisma-booking-repository";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";

describe("booking concurrency", () => {
  const repository = new PrismaBookingRepository(prisma);
  let serviceId = "";
  const email = "race@integration.test";

  beforeAll(async () => {
    await seedCatalog(prisma);
    serviceId = (await prisma.service.findUniqueOrThrow({ where: { slug: "photo-room-rental" } })).id;
    await prisma.booking.deleteMany({ where: { customerEmail: email } });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { customerEmail: email } });
    await prisma.$disconnect();
  });

  it("allows exactly one winner in 20 races for the same room slot", async () => {
    for (let index = 0; index < 20; index += 1) {
      const date = new Date(Date.UTC(2027, 1, 1 + index, 3, 0));
      const command = { serviceId, startTime: date.toISOString(), customerName: "Race Test", customerEmail: email };
      const results = await Promise.allSettled([
        repository.createHold(command, `hash-a-${index}`, new Date("2026-07-05T00:00:00.000Z")),
        repository.createHold(command, `hash-b-${index}`, new Date("2026-07-05T00:00:00.000Z")),
      ]);
      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const rejected = results.find((result) => result.status === "rejected");
      expect(rejected).toMatchObject({ reason: expect.any(BookingConflictError) });
    }
  }, 30_000);
});
