import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { GET } from "@/app/api/availability/route";
import { createGetAvailableSlots } from "@/features/availability/application/get-available-slots";
import { PrismaAvailabilitySource } from "@/features/availability/infrastructure/prisma-availability-source";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";

describe("availability query", () => {
  const source = new PrismaAvailabilitySource(prisma);
  let roomId = "";
  let serviceId = "";

  beforeAll(async () => {
    await seedCatalog(prisma);
    const service = await prisma.service.findUniqueOrThrow({ where: { slug: "photo-room-rental" } });
    roomId = service.roomId; serviceId = service.id;
    await prisma.blockedSlot.deleteMany({ where: { reason: "integration: availability" } });
  });

  afterAll(async () => {
    await prisma.blockedSlot.deleteMany({ where: { reason: "integration: availability" } });
    await prisma.$disconnect();
  });

  it("composes room hours and blocked slots for the requested service", async () => {
    await prisma.blockedSlot.create({ data: {
      roomId, reason: "integration: availability",
      startTime: new Date("2027-01-15T02:00:00.000Z"), endTime: new Date("2027-01-15T14:00:00.000Z"),
    } });
    const slots = await createGetAvailableSlots(source)({ serviceId, date: "2027-01-15", now: "2027-01-01T00:00:00.000Z" });
    expect(slots).toEqual([]);
  });

  it("returns a stable 400 JSON shape for invalid route queries", async () => {
    const response = await GET(new Request("http://localhost/api/availability?serviceId=00000000-0000-4000-8000-000000000000&date=2027-99-99"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "INVALID_QUERY", message: expect.any(String), requestId: expect.any(String) });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
