import { z } from "zod";

import type { Actor } from "@/features/auth/application/current-actor";
import { ForbiddenError } from "@/features/auth/application/require-role";
import type { ServiceRepository, ServiceUpsertData } from "@/features/service/application/service-repository";
import { serviceInputSchema, type ServiceInput } from "@/features/service/application/service-input";
export type { ServiceInput } from "@/features/service/application/service-input";
type ServiceWriter = Pick<ServiceRepository, "upsert" | "setActive">;

export class DuplicateServiceSlugError extends Error {
  constructor() { super("Slug dịch vụ đã tồn tại."); this.name = "DuplicateServiceSlugError"; }
}

function assertAdmin(actor: Actor) { if (actor.role !== "ADMIN") throw new ForbiddenError(); }
function isUniqueError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export function createServiceManager(repository: ServiceWriter) {
  return {
    async upsertService(actor: Actor, input: ServiceInput) {
      assertAdmin(actor);
      const parsed = serviceInputSchema.parse(input) as ServiceUpsertData;
      try { return await repository.upsert(parsed); }
      catch (error) { if (isUniqueError(error)) throw new DuplicateServiceSlugError(); throw error; }
    },
    async setServiceActive(actor: Actor, serviceId: string, active: boolean) {
      assertAdmin(actor);
      return repository.setActive(z.uuid().parse(serviceId), active);
    },
  };
}

async function manager() {
  const [{ PrismaServiceRepository }, { prisma }] = await Promise.all([
    import("@/features/service/infrastructure/prisma-service-repository"),
    import("@/lib/db/prisma"),
  ]);
  return createServiceManager(new PrismaServiceRepository(prisma));
}

export async function upsertService(actor: Actor, input: ServiceInput) { return (await manager()).upsertService(actor, input); }
export async function setServiceActive(actor: Actor, serviceId: string, active: boolean) { return (await manager()).setServiceActive(actor, serviceId, active); }
