import { randomUUID } from "node:crypto";

import { afterAll, afterEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";

const testSuffix = randomUUID();

afterEach(async () => {
  await prisma.$executeRaw`DELETE FROM "PaymentEvent" WHERE "eventId" LIKE ${`constraint-${testSuffix}%`}`;
  await prisma.$executeRaw`DELETE FROM "CustomerProfile" WHERE "name" = ${`Constraint ${testSuffix}`}`;
  await prisma.$executeRaw`DELETE FROM "BlockedSlot" WHERE "reason" = ${`Constraint ${testSuffix}`}`;
  await prisma.$executeRaw`DELETE FROM "Service" WHERE "slug" LIKE ${`constraint-${testSuffix}%`}`;
  await prisma.$executeRaw`DELETE FROM "StudioRoom" WHERE "slug" LIKE ${`constraint-${testSuffix}%`}`;
  await prisma.$executeRaw`DELETE FROM "User" WHERE "email" LIKE ${`constraint-${testSuffix}%`}`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("database constraints", () => {
  it("rejects duplicate room slugs", async () => {
    const slug = `constraint-${testSuffix}-room`;

    await prisma.$executeRaw`
      INSERT INTO "StudioRoom" ("id", "name", "slug", "updatedAt")
      VALUES (${randomUUID()}, 'Constraint room one', ${slug}, NOW())
    `;

    await expect(
      prisma.$executeRaw`
        INSERT INTO "StudioRoom" ("id", "name", "slug", "updatedAt")
        VALUES (${randomUUID()}, 'Constraint room two', ${slug}, NOW())
      `,
    ).rejects.toThrow();
  });

  it("enforces one customer profile per user", async () => {
    const userId = randomUUID();
    const email = `constraint-${testSuffix}-profile@example.com`;
    const profileName = `Constraint ${testSuffix}`;

    await prisma.$executeRaw`
      INSERT INTO "User" ("id", "authUserId", "email", "updatedAt")
      VALUES (${userId}, ${randomUUID()}, ${email}, NOW())
    `;
    await prisma.$executeRaw`
      INSERT INTO "CustomerProfile" ("id", "userId", "name", "updatedAt")
      VALUES (${randomUUID()}, ${userId}, ${profileName}, NOW())
    `;

    await expect(
      prisma.$executeRaw`
        INSERT INTO "CustomerProfile" ("id", "userId", "name", "updatedAt")
        VALUES (${randomUUID()}, ${userId}, ${profileName}, NOW())
      `,
    ).rejects.toThrow();
  });

  it("rejects duplicate provider event identifiers", async () => {
    const eventId = `constraint-${testSuffix}-event`;

    await prisma.$executeRaw`
      INSERT INTO "PaymentEvent" ("id", "provider", "eventId", "payloadHash", "occurredAt")
      VALUES (${randomUUID()}, 'SEPAY'::"PaymentProvider", ${eventId}, 'hash-one', NOW())
    `;

    await expect(
      prisma.$executeRaw`
        INSERT INTO "PaymentEvent" ("id", "provider", "eventId", "payloadHash", "occurredAt")
        VALUES (${randomUUID()}, 'SEPAY'::"PaymentProvider", ${eventId}, 'hash-two', NOW())
      `,
    ).rejects.toThrow();
  });

  it("rejects blocked slots whose end is not after start", async () => {
    const roomId = randomUUID();
    const slug = `constraint-${testSuffix}-blocked-room`;
    const reason = `Constraint ${testSuffix}`;

    await prisma.$executeRaw`
      INSERT INTO "StudioRoom" ("id", "name", "slug", "updatedAt")
      VALUES (${roomId}, 'Constraint blocked room', ${slug}, NOW())
    `;

    await expect(
      prisma.$executeRaw`
        INSERT INTO "BlockedSlot" ("id", "roomId", "startTime", "endTime", "reason", "updatedAt")
        VALUES (${randomUUID()}, ${roomId}, NOW(), NOW(), ${reason}, NOW())
      `,
    ).rejects.toThrow();
  });

  it("rejects services with a non-positive price", async () => {
    const roomId = randomUUID();
    const roomSlug = `constraint-${testSuffix}-price-room`;
    const serviceSlug = `constraint-${testSuffix}-service`;

    await prisma.$executeRaw`
      INSERT INTO "StudioRoom" ("id", "name", "slug", "updatedAt")
      VALUES (${roomId}, 'Constraint price room', ${roomSlug}, NOW())
    `;

    await expect(
      prisma.$executeRaw`
        INSERT INTO "Service" (
          "id", "roomId", "name", "slug", "bookingType",
          "durationMinutes", "priceAmount", "updatedAt"
        )
        VALUES (
          ${randomUUID()}, ${roomId}, 'Invalid price service', ${serviceSlug},
          'ROOM_ONLY'::"BookingType", 60, 0, NOW()
        )
      `,
    ).rejects.toThrow();
  });
});
