import { z } from "zod";

import type { AppRole } from "@/features/auth/application/current-actor";

const identitySchema = z.object({
  authUserId: z.uuid(), email: z.email(), emailVerifiedAt: z.iso.datetime().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LocalUser = Readonly<{ id: string; authUserId: string; email: string; role: AppRole; emailVerifiedAt: string | null }>;
export interface UserIdentityRepository {
  upsertVerifiedIdentity(input: { authUserId: string; email: string; emailVerifiedAt: string }): Promise<LocalUser>;
}

export class UnverifiedIdentityError extends Error {
  constructor() { super("Email của tài khoản chưa được xác minh."); this.name = "UnverifiedIdentityError"; }
}

export function createSyncAuthenticatedUser(repository: UserIdentityRepository) {
  return async function syncAuthenticatedUser(input: unknown): Promise<LocalUser> {
    const identity = identitySchema.parse(input);
    if (!identity.emailVerifiedAt) throw new UnverifiedIdentityError();
    return repository.upsertVerifiedIdentity({
      authUserId: identity.authUserId,
      email: identity.email.trim().toLowerCase(),
      emailVerifiedAt: identity.emailVerifiedAt,
    });
  };
}

export async function syncAuthenticatedUser(input: unknown) {
  const [{ PrismaUserRepository }, { prisma }] = await Promise.all([
    import("@/features/auth/infrastructure/prisma-user-repository"), import("@/lib/db/prisma"),
  ]);
  return createSyncAuthenticatedUser(new PrismaUserRepository(prisma))(input);
}
