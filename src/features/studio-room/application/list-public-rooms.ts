import type { ServiceRecord, ServiceRepository } from "@/features/service/application/service-repository";
import type { RoomRecord, RoomRepository } from "@/features/studio-room/application/room-repository";

export type PublicRoom = RoomRecord & Readonly<{ services: ServiceRecord[] }>;

type Dependencies = Readonly<{
  roomRepository: RoomRepository;
  serviceRepository: ServiceRepository;
}>;

export function createListPublicRooms({ roomRepository, serviceRepository }: Dependencies) {
  return async function listPublicRooms(): Promise<PublicRoom[]> {
    const rooms = await roomRepository.listActive();

    return Promise.all(
      rooms.map(async (room) => ({
        ...room,
        services: await serviceRepository.listByRoom(room.id),
      })),
    );
  };
}

export async function listPublicRooms(): Promise<PublicRoom[]> {
  const [{ PrismaServiceRepository }, { PrismaRoomRepository }, { prisma }] = await Promise.all([
    import("@/features/service/infrastructure/prisma-service-repository"),
    import("@/features/studio-room/infrastructure/prisma-room-repository"),
    import("@/lib/db/prisma"),
  ]);

  return createListPublicRooms({
    roomRepository: new PrismaRoomRepository(prisma),
    serviceRepository: new PrismaServiceRepository(prisma),
  })();
}
