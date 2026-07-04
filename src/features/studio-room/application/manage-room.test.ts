import { describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "@/features/auth/application/require-role";
import {
  createRoomManager,
  DuplicateSlugError,
} from "@/features/studio-room/application/manage-room";

const admin = { id: "admin-1", role: "ADMIN" as const };
const validInput = {
  name: "Photo Studio",
  slug: "photo-studio",
  description: "Không gian chụp ảnh",
  timezone: "Asia/Ho_Chi_Minh",
  displayOrder: 0,
  isActive: true,
} as const;

describe("room management", () => {
  it("rejects unauthorized actors", async () => {
    const manager = createRoomManager({ upsert: vi.fn(), setActive: vi.fn() });
    await expect(manager.upsertRoom({ id: "c1", role: "CUSTOMER" }, validInput)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("validates room input", async () => {
    const manager = createRoomManager({ upsert: vi.fn(), setActive: vi.fn() });
    await expect(manager.upsertRoom(admin, { ...validInput, slug: "Sai Slug" })).rejects.toThrow();
  });

  it("maps duplicate slugs to a domain error", async () => {
    const manager = createRoomManager({
      upsert: vi.fn().mockRejectedValue({ code: "P2002" }),
      setActive: vi.fn(),
    });
    await expect(manager.upsertRoom(admin, validInput)).rejects.toBeInstanceOf(DuplicateSlugError);
  });
});
