import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type {
  ServiceRecord,
  ServiceRepository,
  ServiceUpsertData,
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

  listAll(): Promise<ServiceRecord[]> {
    return this.client.service.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: serviceSelect,
    });
  }

  upsert(input: ServiceUpsertData): Promise<ServiceRecord> {
    const { id, ...data } = input;
    if (!id) return this.client.service.create({ data, select: serviceSelect });
    return this.client.service.upsert({
      create: { ...data, id },
      update: data,
      where: { id },
      select: serviceSelect,
    });
  }

  setActive(id: string, isActive: boolean): Promise<ServiceRecord> {
    return this.client.service.update({ where: { id }, data: { isActive }, select: serviceSelect });
  }
}
