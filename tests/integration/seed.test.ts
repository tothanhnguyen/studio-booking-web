import { afterAll, describe, expect, it } from "vitest";

import { seedCatalog } from "../../prisma/seed";
import { prisma } from "@/lib/db/prisma";
import { SEEDED_ROOM_SLUGS, SEEDED_SERVICE_SLUGS } from "../fixtures/catalog";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("catalog seed", () => {
  it("is idempotent and creates the approved catalog", async () => {
    await seedCatalog(prisma);

    const firstCounts = await Promise.all([
      prisma.studioRoom.count({ where: { slug: { in: [...SEEDED_ROOM_SLUGS] } } }),
      prisma.service.count({ where: { slug: { in: [...SEEDED_SERVICE_SLUGS] } } }),
      prisma.workingHour.count({
        where: { room: { slug: { in: [...SEEDED_ROOM_SLUGS] } } },
      }),
    ]);

    await seedCatalog(prisma);

    const secondCounts = await Promise.all([
      prisma.studioRoom.count({ where: { slug: { in: [...SEEDED_ROOM_SLUGS] } } }),
      prisma.service.count({ where: { slug: { in: [...SEEDED_SERVICE_SLUGS] } } }),
      prisma.workingHour.count({
        where: { room: { slug: { in: [...SEEDED_ROOM_SLUGS] } } },
      }),
    ]);

    expect(firstCounts).toEqual([3, 6, 21]);
    expect(secondCounts).toEqual(firstCounts);
  });
});
