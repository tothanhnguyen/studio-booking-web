import "server-only";

import { PrismaClient } from "@/generated/prisma/client";
import { createPrismaPgAdapter } from "@/lib/db/prisma-adapter";
import { serverEnv } from "@/lib/env/server";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = createPrismaPgAdapter(serverEnv.DATABASE_URL);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
