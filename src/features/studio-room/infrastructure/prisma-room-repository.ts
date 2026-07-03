import type { PrismaClient } from "@/generated/prisma/client";
import type {
  RoomRecord,
  RoomRepository,
} from "@/features/studio-room/application/room-repository";

const roomSelect = {
  description: true,
  displayOrder: true,
  id: true,
  isActive: true,
  name: true,
  slug: true,
  timezone: true,
} as const;

export class PrismaRoomRepository implements RoomRepository {
  constructor(private readonly client: PrismaClient) {}

  findActiveBySlug(slug: string): Promise<RoomRecord | null> {
    return this.client.studioRoom.findFirst({
      select: roomSelect,
      where: { isActive: true, slug },
    });
  }

  listActive(): Promise<RoomRecord[]> {
    return this.client.studioRoom.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: roomSelect,
      where: { isActive: true },
    });
  }
}
