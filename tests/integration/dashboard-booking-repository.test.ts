import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaDashboardBookingRepository } from "@/features/dashboard/infrastructure/prisma-dashboard-booking-repository";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";

describe("dashboard booking repository", () => {
  const repository = new PrismaDashboardBookingRepository(prisma);
  const emails = ["dashboard-owner@test.local", "dashboard-other@test.local"];
  let ownerId = ""; let otherId = "";

  beforeAll(async () => {
    await seedCatalog(prisma);
    await prisma.booking.deleteMany({ where: { customerEmail: { in: emails } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    ownerId = (await prisma.user.create({ data: { authUserId: "30000000-0000-4000-8000-000000000001", email: emails[0]!, emailVerifiedAt: new Date() } })).id;
    otherId = (await prisma.user.create({ data: { authUserId: "30000000-0000-4000-8000-000000000002", email: emails[1]!, emailVerifiedAt: new Date() } })).id;
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: "photo-room-rental" }, include: { room: true } });
    for (const [index, userId] of [ownerId, otherId].entries()) {
      await prisma.booking.create({ data: {
        userId, roomId: service.roomId, serviceId: service.id, roomName: service.room.name, serviceName: service.name,
        bookingType: service.bookingType, customerName: `Dashboard ${index}`, customerEmail: emails[index]!,
        startTime: new Date(`2027-08-0${index + 1}T02:00:00.000Z`), endTime: new Date(`2027-08-0${index + 1}T04:00:00.000Z`),
        bufferEndTime: new Date(`2027-08-0${index + 1}T04:30:00.000Z`), subtotalAmount: 800_000,
        depositAmount: 240_000, remainingAmount: 560_000, bookingStatus: index === 0 ? "CONFIRMED" : "PENDING",
      } });
    }
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { customerEmail: { in: emails } } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, otherId] } } });
    await prisma.$disconnect();
  });

  it("isolates owner lists and direct-id reads", async () => {
    const ownerPage = await repository.listOwned(ownerId, { page: 1, pageSize: 10 });
    expect(ownerPage.total).toBe(1);
    expect(ownerPage.items[0]?.customerEmail).toBe(emails[0]);
    expect(ownerPage.items[0]?.startTime).toBe("2027-08-01T02:00:00.000Z");
    const otherBooking = (await repository.listOwned(otherId, { page: 1, pageSize: 10 })).items[0]!;
    await expect(repository.findOwnedById(ownerId, otherBooking.id)).resolves.toBeNull();
  });

  it("filters admin pages and returns a half-open calendar range", async () => {
    const confirmed = await repository.listAll({ status: "CONFIRMED", page: 1, pageSize: 1 });
    expect(confirmed.total).toBe(1);
    const calendar = await repository.listCalendar({ from: new Date("2027-08-01T00:00:00.000Z"), to: new Date("2027-08-02T00:00:00.000Z") });
    expect(calendar.map((booking) => booking.customerEmail)).toContain(emails[0]);
    expect(calendar.map((booking) => booking.customerEmail)).not.toContain(emails[1]);
  });
});
