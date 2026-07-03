import { describe, expect, it, vi } from "vitest";

import type { ServiceRepository } from "@/features/service/application/service-repository";
import { createGetPublicServiceBySlug } from "@/features/service/application/get-public-service";

describe("getPublicServiceBySlug", () => {
  it("returns the active service matching the slug", async () => {
    const service = {
      id: "service-photo",
      roomId: "room-photo",
      name: "Chụp ảnh tự túc",
      slug: "chup-anh-tu-tuc",
      description: null,
      bookingType: "ROOM_ONLY" as const,
      durationMinutes: 60,
      bufferMinutes: 15,
      priceAmount: 500_000,
      currency: "VND",
      isActive: true,
      displayOrder: 1,
    };
    const repository = {
      findActiveBySlug: vi.fn().mockResolvedValue(service),
    } as unknown as ServiceRepository;

    await expect(createGetPublicServiceBySlug(repository)(service.slug)).resolves.toEqual(service);
  });

  it("returns null when no active service matches the slug", async () => {
    const repository = {
      findActiveBySlug: vi.fn().mockResolvedValue(null),
    } as unknown as ServiceRepository;

    await expect(createGetPublicServiceBySlug(repository)("khong-ton-tai")).resolves.toBeNull();
  });
});
