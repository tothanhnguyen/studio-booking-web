import { afterAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";

describe("database connection", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("executes SELECT 1 against PostgreSQL", async () => {
    const rows = await prisma.$queryRaw<Array<{ value: number }>>`SELECT 1 AS value`;

    expect(rows).toEqual([{ value: 1 }]);
  });
});
