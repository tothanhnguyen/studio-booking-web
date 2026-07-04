import { z } from "zod";

import type { Actor } from "@/features/auth/application/current-actor";
import { ForbiddenError } from "@/features/auth/application/require-role";
import type { RoomRepository, RoomUpsertData } from "@/features/studio-room/application/room-repository";
import { roomInputSchema, type RoomInput } from "@/features/studio-room/application/room-input";
export type { RoomInput } from "@/features/studio-room/application/room-input";

type RoomWriter = Pick<RoomRepository, "upsert" | "setActive">;

export class DuplicateSlugError extends Error {
  constructor() { super("Slug phòng đã tồn tại."); this.name = "DuplicateSlugError"; }
}

function assertAdmin(actor: Actor) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();
}

function isUniqueError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export function createRoomManager(repository: RoomWriter) {
  return {
    async upsertRoom(actor: Actor, input: RoomInput) {
      assertAdmin(actor);
      const parsed = roomInputSchema.parse(input) as RoomUpsertData;
      try { return await repository.upsert(parsed); }
      catch (error) { if (isUniqueError(error)) throw new DuplicateSlugError(); throw error; }
    },
    async setRoomActive(actor: Actor, roomId: string, active: boolean) {
      assertAdmin(actor);
      return repository.setActive(z.uuid().parse(roomId), active);
    },
  };
}

async function manager() {
  const [{ PrismaRoomRepository }, { prisma }] = await Promise.all([
    import("@/features/studio-room/infrastructure/prisma-room-repository"),
    import("@/lib/db/prisma"),
  ]);
  return createRoomManager(new PrismaRoomRepository(prisma));
}

export async function upsertRoom(actor: Actor, input: RoomInput) { return (await manager()).upsertRoom(actor, input); }
export async function setRoomActive(actor: Actor, roomId: string, active: boolean) { return (await manager()).setRoomActive(actor, roomId, active); }
