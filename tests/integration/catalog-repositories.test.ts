import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedCatalog } from "../../prisma/seed";
import { PrismaRoomRepository } from "@/features/studio-room/infrastructure/prisma-room-repository";
import { PrismaServiceRepository } from "@/features/service/infrastructure/prisma-service-repository";
import { prisma } from "@/lib/db/prisma";
import { SEEDED_ROOM_SLUGS } from "../fixtures/catalog";

const inactiveRoomSlug = `inactive-room-${randomUUID()}`;
const inactiveServiceSlug = `inactive-service-${randomUUID()}`;

beforeAll(async () => {
  await seedCatalog(prisma);
  const inactiveRoom = await prisma.studioRoom.create({
    data: {
      isActive: false,
      name: "Inactive test room",
      slug: inactiveRoomSlug,
    },
  });
  await prisma.service.create({
    data: {
      bookingType: "ROOM_ONLY",
      durationMinutes: 60,
      isActive: false,
      name: "Inactive test service",
      priceAmount: 100_000,
      roomId: inactiveRoom.id,
      slug: inactiveServiceSlug,
    },
  });
});

afterAll(async () => {
  await prisma.service.deleteMany({ where: { slug: inactiveServiceSlug } });
  await prisma.studioRoom.deleteMany({ where: { slug: inactiveRoomSlug } });
  await prisma.$disconnect();
});

describe("catalog repositories", () => {
  const roomRepository = new PrismaRoomRepository(prisma);
  const serviceRepository = new PrismaServiceRepository(prisma);

  it("lists active rooms in display order and hides inactive rooms", async () => {
    const rooms = await roomRepository.listActive();

    expect(rooms.map((room) => room.slug)).toEqual([...SEEDED_ROOM_SLUGS]);
    expect(rooms.some((room) => room.slug === inactiveRoomSlug)).toBe(false);
  });

  it("returns null when a room slug is inactive", async () => {
    await expect(roomRepository.findActiveBySlug(inactiveRoomSlug)).resolves.toBeNull();
  });

  it("finds active services and lists them only for their room", async () => {
    const photoRoom = await roomRepository.findActiveBySlug("photo-studio");
    const photoService = await serviceRepository.findActiveBySlug("photo-room-rental");

    expect(photoRoom).not.toBeNull();
    expect(photoService?.roomId).toBe(photoRoom?.id);

    const roomServices = await serviceRepository.listByRoom(photoRoom!.id);
    expect(roomServices).toHaveLength(2);
    expect(roomServices.every((service) => service.roomId === photoRoom!.id)).toBe(true);
  });

  it("returns null for inactive services by id and slug", async () => {
    const inactiveService = await prisma.service.findUniqueOrThrow({
      where: { slug: inactiveServiceSlug },
    });

    await expect(serviceRepository.findActiveById(inactiveService.id)).resolves.toBeNull();
    await expect(serviceRepository.findActiveBySlug(inactiveServiceSlug)).resolves.toBeNull();
  });
});
