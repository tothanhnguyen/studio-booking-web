import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaBookingRepository } from "@/features/booking/infrastructure/prisma-booking-repository";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";

describe("guest booking claim", () => {
  const repository = new PrismaBookingRepository(prisma);
  const emails = ["claim@integration.test", "other@integration.test"];
  let roomId = ""; let serviceId = ""; let firstUserId = ""; let secondUserId = "";

  const claimEmailFilter = { OR: emails.map((email) => ({ customerEmail: { equals: email, mode: "insensitive" as const } })) };

  beforeAll(async () => {
    await seedCatalog(prisma);
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: "photo-room-rental" } });
    roomId = service.roomId; serviceId = service.id;
    await prisma.booking.deleteMany({ where: claimEmailFilter });
    await prisma.user.deleteMany({ where: { email: { in: ["claim-user-1@test.local", "claim-user-2@test.local"] } } });
    firstUserId = (await prisma.user.create({ data: { authUserId: "20000000-0000-4000-8000-000000000001", email: "claim-user-1@test.local", emailVerifiedAt: new Date() } })).id;
    secondUserId = (await prisma.user.create({ data: { authUserId: "20000000-0000-4000-8000-000000000002", email: "claim-user-2@test.local", emailVerifiedAt: new Date() } })).id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: claimEmailFilter });
    await prisma.user.deleteMany({ where: { id: { in: [firstUserId, secondUserId] } } });
    await prisma.$disconnect();
  });

  async function createBooking(customerEmail: string, userId?: string) {
    return prisma.booking.create({ data: {
      userId, roomId, serviceId, roomName: "Photo Studio", serviceName: "Thuê phòng chụp ảnh", bookingType: "ROOM_ONLY",
      customerName: "Claim Test", customerEmail, startTime: new Date("2027-05-01T02:00:00Z"), endTime: new Date("2027-05-01T04:00:00Z"), bufferEndTime: new Date("2027-05-01T04:30:00Z"),
      subtotalAmount: 800000, depositAmount: 240000, remainingAmount: 560000,
    } });
  }

  it("claims only unowned case-insensitive matches and is idempotent", async () => {
    const guest = await createBooking("CLAIM@Integration.Test");
    const owned = await createBooking(emails[0]!, secondUserId);
    await createBooking(emails[1]!);
    expect(await repository.claimUnownedByVerifiedEmail(firstUserId, emails[0]!)).toBe(1);
    expect(await repository.claimUnownedByVerifiedEmail(firstUserId, emails[0]!)).toBe(0);
    expect((await prisma.booking.findUniqueOrThrow({ where: { id: guest.id } })).userId).toBe(firstUserId);
    expect((await prisma.booking.findUniqueOrThrow({ where: { id: owned.id } })).userId).toBe(secondUserId);
  });

  it("compare-and-set gives a concurrent claim to at most one user", async () => {
    const guest = await createBooking(emails[0]!);
    const counts = await Promise.all([
      repository.claimUnownedByVerifiedEmail(firstUserId, emails[0]!),
      repository.claimUnownedByVerifiedEmail(secondUserId, emails[0]!),
    ]);
    expect(counts.sort()).toEqual([0, 1]);
    expect([firstUserId, secondUserId]).toContain((await prisma.booking.findUniqueOrThrow({ where: { id: guest.id } })).userId);
  });
});
