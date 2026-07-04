import { describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "@/features/auth/application/require-role";
import {
  createServiceManager,
  DuplicateServiceSlugError,
} from "@/features/service/application/manage-service";

const admin = { id: "admin-1", role: "ADMIN" as const };
const validInput = {
  roomId: "2189c3be-fcb5-4dd9-8957-feb14f170ab8",
  name: "Thuê phòng chụp ảnh",
  slug: "photo-room-rental",
  description: "Thuê phòng tự túc",
  bookingType: "ROOM_ONLY" as const,
  durationMinutes: 60,
  bufferMinutes: 15,
  priceAmount: 500_000,
  currency: "VND",
  displayOrder: 0,
  isActive: true,
} as const;

describe("service management", () => {
  it.each([
    ["durationMinutes", 0],
    ["bufferMinutes", -1],
    ["priceAmount", 10.5],
  ] as const)("rejects invalid %s", async (field, value) => {
    const manager = createServiceManager({ upsert: vi.fn(), setActive: vi.fn() });
    await expect(manager.upsertService(admin, { ...validInput, [field]: value })).rejects.toThrow();
  });

  it("rejects unauthorized actors", async () => {
    const manager = createServiceManager({ upsert: vi.fn(), setActive: vi.fn() });
    await expect(manager.setServiceActive({ id: "c1", role: "CUSTOMER" }, validInput.roomId, false)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("maps duplicate slugs to a domain error", async () => {
    const manager = createServiceManager({
      upsert: vi.fn().mockRejectedValue({ code: "P2002" }),
      setActive: vi.fn(),
    });
    await expect(manager.upsertService(admin, validInput)).rejects.toBeInstanceOf(DuplicateServiceSlugError);
  });
});
