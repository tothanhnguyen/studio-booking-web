import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaBookingRepository } from "@/features/booking/infrastructure/prisma-booking-repository";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";

describe("booking transaction rollback", () => {
  const repository = new PrismaBookingRepository(prisma);
  const email = "rollback@integration.test";
  let serviceId = "";

  beforeAll(async () => {
    await seedCatalog(prisma);
    serviceId = (await prisma.service.findUniqueOrThrow({ where: { slug: "photo-room-rental" } })).id;
    await prisma.booking.deleteMany({ where: { customerEmail: email } });
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS "integration_fail_payment" ON "Payment"');
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS integration_fail_payment()');
    await prisma.booking.deleteMany({ where: { customerEmail: email } });
    await prisma.$disconnect();
  });

  it("rolls back the booking when payment creation fails", async () => {
    await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION integration_fail_payment() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'integration payment failure'; END; $$ LANGUAGE plpgsql`);
    await prisma.$executeRawUnsafe('CREATE TRIGGER "integration_fail_payment" BEFORE INSERT ON "Payment" FOR EACH ROW EXECUTE FUNCTION integration_fail_payment()');

    await expect(repository.createHold({
      serviceId, startTime: "2027-03-01T03:00:00.000Z", customerName: "Rollback Test", customerEmail: email,
    }, "rollback-hash", new Date("2026-07-05T00:00:00.000Z"))).rejects.toThrow("integration payment failure");

    expect(await prisma.booking.count({ where: { customerEmail: email } })).toBe(0);
  });
});
