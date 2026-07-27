import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DashboardBooking } from "@/features/dashboard/application/dashboard-booking-repository";
import { BookingDetail } from "@/features/dashboard/presentation/booking-detail";

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

const booking: DashboardBooking = {
  id: "booking-1",
  customerName: "Khách Test",
  customerEmail: "khach@example.com",
  customerPhone: null,
  note: null,
  roomName: "Photo Studio",
  serviceName: "Chụp ảnh sản phẩm",
  bookingType: "ROOM_ONLY",
  startTime: "2027-08-01T02:00:00.000Z",
  endTime: "2027-08-01T04:00:00.000Z",
  subtotalAmount: 1200000,
  depositAmount: 360000,
  remainingAmount: 840000,
  currency: "VND",
  bookingStatus: "CONFIRMED",
  paymentStatus: "PAID",
  refundStatus: "NONE",
  createdAt: "2027-07-01T00:00:00.000Z",
};

describe("BookingDetail", () => {
  it("renders scroll-reveal choreography for the account variant", () => {
    const { container } = render(<BookingDetail booking={booking} />);
    expect(container.querySelectorAll(".scroll-reveal").length).toBeGreaterThan(0);
  });

  it("renders no scroll-reveal node for the admin variant", () => {
    const { container } = render(<BookingDetail booking={booking} variant="admin" />);
    expect(container.querySelectorAll(".scroll-reveal")).toHaveLength(0);
  });

  it("renders localized payment and refund status labels instead of raw enums", () => {
    render(<BookingDetail booking={booking} variant="admin" />);
    expect(screen.getByText("Đã thanh toán")).toBeInTheDocument();
    expect(screen.getByText("Không có")).toBeInTheDocument();
    expect(screen.queryByText("PAID")).not.toBeInTheDocument();
  });
});
