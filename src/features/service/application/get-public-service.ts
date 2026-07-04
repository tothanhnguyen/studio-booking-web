import type { ServiceRecord, ServiceRepository } from "@/features/service/application/service-repository";

export type PublicService = ServiceRecord;

export function createGetPublicServiceBySlug(repository: ServiceRepository) {
  return (slug: string): Promise<PublicService | null> => repository.findActiveBySlug(slug);
}

export async function getPublicServiceBySlug(slug: string): Promise<PublicService | null> {
  const [{ PrismaServiceRepository }, { prisma }] = await Promise.all([
    import("@/features/service/infrastructure/prisma-service-repository"),
    import("@/lib/db/prisma"),
  ]);

  return createGetPublicServiceBySlug(new PrismaServiceRepository(prisma))(slug);
}
