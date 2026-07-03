import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, type BookingType } from "../src/generated/prisma/client";
import { parseServerEnv } from "../src/lib/env/server-schema";

const rooms = [
  {
    displayOrder: 0,
    name: "Photo Studio",
    slug: "photo-studio",
    description: "Không gian chụp ảnh linh hoạt cho cá nhân, sản phẩm và thương hiệu.",
  },
  {
    displayOrder: 1,
    name: "Voice/Podcast Booth",
    slug: "voice-podcast-booth",
    description: "Booth cách âm dành cho podcast, voice-over và nội dung hội thoại.",
  },
  {
    displayOrder: 2,
    name: "Music Studio",
    slug: "music-studio",
    description: "Phòng thu âm và sản xuất âm nhạc cho nghệ sĩ độc lập.",
  },
] as const;

const services = [
  {
    bookingType: "ROOM_ONLY",
    bufferMinutes: 30,
    displayOrder: 0,
    durationMinutes: 120,
    name: "Thuê phòng chụp ảnh",
    priceAmount: 800_000,
    roomSlug: "photo-studio",
    slug: "photo-room-rental",
  },
  {
    bookingType: "ASSISTED",
    bufferMinutes: 30,
    displayOrder: 1,
    durationMinutes: 120,
    name: "Buổi chụp có trợ lý",
    priceAmount: 1_200_000,
    roomSlug: "photo-studio",
    slug: "assisted-photo-session",
  },
  {
    bookingType: "ROOM_ONLY",
    bufferMinutes: 15,
    displayOrder: 0,
    durationMinutes: 60,
    name: "Thuê booth podcast",
    priceAmount: 350_000,
    roomSlug: "voice-podcast-booth",
    slug: "podcast-booth-rental",
  },
  {
    bookingType: "ASSISTED",
    bufferMinutes: 30,
    displayOrder: 1,
    durationMinutes: 90,
    name: "Thu âm cùng kỹ thuật viên",
    priceAmount: 650_000,
    roomSlug: "voice-podcast-booth",
    slug: "assisted-podcast-recording",
  },
  {
    bookingType: "ROOM_ONLY",
    bufferMinutes: 30,
    displayOrder: 0,
    durationMinutes: 120,
    name: "Thuê phòng thu âm",
    priceAmount: 700_000,
    roomSlug: "music-studio",
    slug: "music-studio-rental",
  },
  {
    bookingType: "ASSISTED",
    bufferMinutes: 45,
    displayOrder: 1,
    durationMinutes: 180,
    name: "Sản xuất âm nhạc cùng producer",
    priceAmount: 1_500_000,
    roomSlug: "music-studio",
    slug: "assisted-music-production",
  },
] as const satisfies ReadonlyArray<{
  bookingType: BookingType;
  bufferMinutes: number;
  displayOrder: number;
  durationMinutes: number;
  name: string;
  priceAmount: number;
  roomSlug: string;
  slug: string;
}>;

export async function seedCatalog(client: PrismaClient): Promise<void> {
  const roomIds = new Map<string, string>();

  for (const room of rooms) {
    const savedRoom = await client.studioRoom.upsert({
      create: room,
      update: room,
      where: { slug: room.slug },
    });
    roomIds.set(room.slug, savedRoom.id);
  }

  for (const service of services) {
    const { roomSlug, ...serviceData } = service;
    const roomId = roomIds.get(roomSlug);
    if (!roomId) {
      throw new Error(`Seed room missing for service ${service.slug}`);
    }

    await client.service.upsert({
      create: { ...serviceData, roomId },
      update: { ...serviceData, roomId },
      where: { slug: service.slug },
    });
  }

  for (const roomId of roomIds.values()) {
    for (let weekday = 0; weekday <= 6; weekday += 1) {
      await client.workingHour.upsert({
        create: { closeMinute: 1260, openMinute: 540, roomId, weekday },
        update: { isActive: true },
        where: {
          roomId_weekday_openMinute_closeMinute: {
            closeMinute: 1260,
            openMinute: 540,
            roomId,
            weekday,
          },
        },
      });
    }
  }
}

async function main() {
  const environment = parseServerEnv(process.env);
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
  });

  try {
    await seedCatalog(client);
  } finally {
    await client.$disconnect();
  }
}

if (process.argv[1]?.endsWith("prisma/seed.ts")) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
