import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { ServiceRecord } from "@/features/service/application/service-repository";

import { ServiceCard } from "./service-card";

afterEach(cleanup);

const serviceFixture = {
  id: "service-photo-hourly",
  roomId: "room-photo",
  name: "Thuê phòng chụp ảnh",
  slug: "photo-room-rental",
  description: "Không gian riêng cho một buổi chụp tập trung.",
  bookingType: "ROOM_ONLY",
  durationMinutes: 60,
  bufferMinutes: 15,
  priceAmount: 450_000,
  currency: "VND",
  isActive: true,
  displayOrder: 1,
} satisfies ServiceRecord;

describe("ServiceCard", () => {
  it("renders a service as an accessible horizontal row", () => {
    render(<ServiceCard service={serviceFixture} />);

    expect(screen.getByRole("article")).toHaveClass("service-row");
    expect(screen.getByText("60 phút")).toHaveClass("type-mono");
    expect(
      screen.getByRole("link", { name: "Xem dịch vụ" }),
    ).toHaveAttribute("href", "/services/photo-room-rental");
  });
});
