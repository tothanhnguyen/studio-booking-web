import type { Prisma } from "@/generated/prisma/client";

export async function withRoomDateLock<T>(tx: Prisma.TransactionClient, roomId: string, localDate: string, callback: () => Promise<T>): Promise<T> {
  const key = `${roomId}:${localDate}`;
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))::text AS locked`;
  return callback();
}
