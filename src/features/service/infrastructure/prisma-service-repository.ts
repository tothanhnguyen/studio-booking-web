import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type {
  ServiceRecord,
  ServiceRepository,
} from "@/features/service/application/service-repository";

const serviceSelect = {
  bookingType: true,
  bufferMinutes: true,
  currency: true,
  description: true,
  displayOrder: true,
  durationMinutes: true,
  id: true,
  isActive: true,
  name: true,
  priceAmount: true,
  roomId: true,
  slug: true,
} satisfies Prisma.ServiceSelect;

export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly client: PrismaClient) {}

  findActiveById(id: string): Promise<ServiceRecord | null> {
    return this.client.service.findFirst({
      select: serviceSelect,
      where: { id, isActive: true },
    });
  }

  findActiveBySlug(slug: string): Promise<ServiceRecord | null> {
    return this.client.service.findFirst({
      select: serviceSelect,
      where: { isActive: true, slug },
    });
  }

  listByRoom(roomId: string): Promise<ServiceRecord[]> {
    return this.client.service.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: serviceSelect,
      where: { isActive: true, roomId },
    });
  }
}
