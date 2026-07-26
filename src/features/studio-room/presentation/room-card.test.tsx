import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicRoom } from "@/features/studio-room/application/list-public-rooms";

import { RoomCard } from "./room-card";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const roomFixture = {
  id: "room-photo",
  name: "Photo Studio",
  slug: "photo-studio",
  description: "Không gian chụp ảnh với ánh sáng linh hoạt.",
  timezone: "Asia/Ho_Chi_Minh",
  isActive: true,
  displayOrder: 1,
  services: [
    {
      id: "service-photo-hourly",
      roomId: "room-photo",
      name: "Thuê phòng chụp ảnh",
      slug: "photo-room-rental",
      description: "Thuê phòng theo giờ.",
      bookingType: "ROOM_ONLY",
      durationMinutes: 60,
      bufferMinutes: 15,
      priceAmount: 450_000,
      currency: "VND",
      isActive: true,
      displayOrder: 1,
    },
    {
      id: "service-photo-session",
      roomId: "room-photo",
      name: "Buổi chụp chân dung",
      slug: "portrait-session",
      description: "Buổi chụp có ekip hỗ trợ.",
      bookingType: "ASSISTED",
      durationMinutes: 120,
      bufferMinutes: 15,
      priceAmount: 1_200_000,
      currency: "VND",
      isActive: true,
      displayOrder: 2,
    },
  ],
} satisfies PublicRoom;

describe("RoomCard", () => {
  it("renders a room as an accessible atlas row", () => {
    render(<RoomCard index={1} room={roomFixture} />);

    expect(screen.getByRole("article")).toHaveAttribute(
      "data-room-slug",
      "photo-studio",
    );
    expect(
      screen.getByRole("img", { name: /Photo Studio/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 dịch vụ")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Khám phá Photo Studio" }),
    ).toHaveAttribute("href", "/studios/photo-studio");
  });

  it("renders its magazine index marker", () => {
    render(<RoomCard index={2} room={roomFixture} />);
    expect(screen.getByText("02")).toBeInTheDocument();
  });
});
