import { describe, expect, it } from "vitest";

import {
  createRequireRole,
  ForbiddenError,
  UnauthenticatedError,
} from "@/features/auth/application/require-role";

describe("requireRole", () => {
  it("rejects a guest", async () => {
    const requireRole = createRequireRole(async () => null);

    await expect(requireRole("ADMIN")).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("rejects an authenticated actor without the required role", async () => {
    const requireRole = createRequireRole(async () => ({ id: "customer-1", role: "CUSTOMER" }));

    await expect(requireRole("ADMIN")).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("returns an actor with the required role", async () => {
    const actor = { id: "admin-1", role: "ADMIN" as const };
    const requireRole = createRequireRole(async () => actor);

    await expect(requireRole("ADMIN")).resolves.toEqual(actor);
  });
});
