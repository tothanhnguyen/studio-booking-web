import type { PrismaClient } from "@/generated/prisma/client";
import type { LocalUser, UserIdentityRepository } from "@/features/auth/application/sync-user";

export class PrismaUserRepository implements UserIdentityRepository {
  constructor(private readonly client: PrismaClient) {}

  async upsertVerifiedIdentity(input: { authUserId: string; email: string; emailVerifiedAt: string }): Promise<LocalUser> {
    const user = await this.client.user.upsert({
      where: { authUserId: input.authUserId },
      create: { authUserId: input.authUserId, email: input.email, emailVerifiedAt: new Date(input.emailVerifiedAt), role: "CUSTOMER" },
      update: { email: input.email, emailVerifiedAt: new Date(input.emailVerifiedAt) },
      select: { id: true, authUserId: true, email: true, role: true, emailVerifiedAt: true },
    });
    return { ...user, emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null };
  }
}
