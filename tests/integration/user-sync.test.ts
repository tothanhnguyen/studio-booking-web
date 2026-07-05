import { afterAll, describe, expect, it } from "vitest";

import { createSyncAuthenticatedUser } from "@/features/auth/application/sync-user";
import { PrismaUserRepository } from "@/features/auth/infrastructure/prisma-user-repository";
import { prisma } from "@/lib/db/prisma";

describe("user identity sync", () => {
  const authUserId = "10000000-0000-4000-8000-000000000001";
  const sync = createSyncAuthenticatedUser(new PrismaUserRepository(prisma));

  afterAll(async () => { await prisma.user.deleteMany({ where: { authUserId } }); await prisma.$disconnect(); });

  it("creates CUSTOMER, updates verified email, and preserves an existing role", async () => {
    const first = await sync({ authUserId, email: "FIRST@Example.com", emailVerifiedAt: "2026-07-05T00:00:00.000Z" });
    expect(first).toMatchObject({ email: "first@example.com", role: "CUSTOMER" });
    await prisma.user.update({ where: { authUserId }, data: { role: "ADMIN" } });
    const second = await sync({ authUserId, email: "second@example.com", emailVerifiedAt: "2026-07-05T01:00:00.000Z" });
    expect(second).toMatchObject({ id: first.id, email: "second@example.com", role: "ADMIN" });
  });
});
