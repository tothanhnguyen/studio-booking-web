import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaScheduleRepository } from "@/features/availability/infrastructure/prisma-schedule-repository";
import { prisma } from "@/lib/db/prisma";
import { seedCatalog } from "../../prisma/seed";

describe("PrismaScheduleRepository", () => {
  const repository = new PrismaScheduleRepository(prisma);
  let roomId = "";

  beforeAll(async () => {
    await seedCatalog(prisma);
    roomId = (await prisma.studioRoom.findUniqueOrThrow({ where: { slug: "photo-studio" } })).id;
    await prisma.blockedSlot.deleteMany({ where: { roomId, reason: { startsWith: "integration:" } } });
  });

  afterAll(async () => {
    await prisma.blockedSlot.deleteMany({ where: { roomId, reason: { startsWith: "integration:" } } });
    await prisma.workingHour.deleteMany({ where: { roomId } });
    await seedCatalog(prisma);
    await prisma.$disconnect();
  });

  it("replaces all working windows for a weekday atomically", async () => {
    await repository.replaceWorkingHours(roomId, 1, [
      { openMinute: 540, closeMinute: 720 },
      { openMinute: 780, closeMinute: 1020 },
    ]);
    const monday = (await repository.listWorkingHours(roomId)).filter((row) => row.weekday === 1);
    expect(monday.map(({ openMinute, closeMinute }) => ({ openMinute, closeMinute }))).toEqual([
      { openMinute: 540, closeMinute: 720 },
      { openMinute: 780, closeMinute: 1020 },
    ]);
  });

  it("rejects overlapping windows at the repository boundary", async () => {
    await expect(repository.replaceWorkingHours(roomId, 2, [
      { openMinute: 540, closeMinute: 720 },
      { openMinute: 700, closeMinute: 800 },
    ])).rejects.toThrow("overlap");
  });

  it("creates and deletes a same-day blocked slot", async () => {
    const created = await repository.createBlockedSlot({ roomId, startTime: "2026-07-06T02:00:00.000Z", endTime: "2026-07-06T03:00:00.000Z", reason: "integration: maintenance" });
    expect((await repository.listBlockedSlots(roomId)).some((row) => row.id === created.id)).toBe(true);
    await repository.deleteBlockedSlot(created.id);
    expect((await repository.listBlockedSlots(roomId)).some((row) => row.id === created.id)).toBe(false);
  });

  it("rejects a blocked slot spanning local dates", async () => {
    await expect(repository.createBlockedSlot({ roomId, startTime: "2026-07-06T16:30:00.000Z", endTime: "2026-07-06T17:30:00.000Z", reason: "integration: invalid" })).rejects.toThrow("local day");
  });
});
