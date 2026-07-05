import { describe, expect, it, vi } from "vitest";

import { createSyncAuthenticatedUser, UnverifiedIdentityError } from "@/features/auth/application/sync-user";

describe("syncAuthenticatedUser", () => {
  it("syncs a verified identity without forwarding role metadata", async () => {
    const user = { id: "user-1", authUserId: "2189c3be-fcb5-4dd9-8957-feb14f170ab8", email: "an@example.com", role: "CUSTOMER" as const, emailVerifiedAt: "2026-07-05T00:00:00.000Z" };
    const repository = { upsertVerifiedIdentity: vi.fn().mockResolvedValue(user) };
    const sync = createSyncAuthenticatedUser(repository);

    await expect(sync({
      authUserId: user.authUserId, email: "AN@Example.com", emailVerifiedAt: user.emailVerifiedAt,
      metadata: { role: "ADMIN", app_role: "ADMIN" },
    })).resolves.toEqual(user);
    expect(repository.upsertVerifiedIdentity).toHaveBeenCalledWith({
      authUserId: user.authUserId, email: "an@example.com", emailVerifiedAt: user.emailVerifiedAt,
    });
  });

  it("rejects an identity whose email is not verified", async () => {
    const repository = { upsertVerifiedIdentity: vi.fn() };
    await expect(createSyncAuthenticatedUser(repository)({
      authUserId: "2189c3be-fcb5-4dd9-8957-feb14f170ab8", email: "an@example.com", emailVerifiedAt: null,
    })).rejects.toBeInstanceOf(UnverifiedIdentityError);
    expect(repository.upsertVerifiedIdentity).not.toHaveBeenCalled();
  });
});
