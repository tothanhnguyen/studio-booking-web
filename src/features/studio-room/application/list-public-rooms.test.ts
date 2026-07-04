import { describe, expect, it, vi } from "vitest";

import type { ServiceRepository } from "@/features/service/application/service-repository";
import type { RoomRepository } from "@/features/studio-room/application/room-repository";
import { createListPublicRooms } from "@/features/studio-room/application/list-public-rooms";

const rooms = [
  {
    id: "room-photo",
    name: "Photo Studio",
    slug: "photo-studio",
    description: "Không gian chụp ảnh.",
    timezone: "Asia/Ho_Chi_Minh",
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "room-music",
    name: "Music Studio",
    slug: "music-studio",
    description: "Không gian thu âm.",
    timezone: "Asia/Ho_Chi_Minh",
    isActive: true,
    displayOrder: 2,
  },
] as const;

describe("listPublicRooms", () => {
  it("returns active rooms with their active services", async () => {
    const roomRepository = {
      listActive: vi.fn().mockResolvedValue(rooms),
    } as unknown as RoomRepository;
    const serviceRepository = {
      listByRoom: vi
        .fn()
        .mockResolvedValueOnce([
          {
            id: "service-photo",
            roomId: "room-photo",
            name: "Chụp ảnh tự túc",
            slug: "chup-anh-tu-tuc",
            description: null,
            bookingType: "ROOM_ONLY",
            durationMinutes: 60,
            bufferMinutes: 15,
            priceAmount: 500_000,
            currency: "VND",
            isActive: true,
            displayOrder: 1,
          },
        ])
        .mockResolvedValueOnce([]),
    } as unknown as ServiceRepository;

    const result = await createListPublicRooms({
      roomRepository,
      serviceRepository,
    })();

    expect(result).toHaveLength(2);
    expect(result[0]?.services).toHaveLength(1);
    expect(result[0]?.services[0]?.slug).toBe("chup-anh-tu-tuc");
    expect(result[1]?.services).toEqual([]);
    expect(serviceRepository.listByRoom).toHaveBeenCalledTimes(2);
  });
});
