import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/booking/application/booking-actions", () => ({
  createBookingAction: vi.fn(),
}));

import { BookingWizard } from "./booking-wizard";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BookingWizard", () => {
  it("presents progress, the active contact step, and service context", () => {
    render(
      <BookingWizard
        durationMinutes={60}
        priceAmount={500_000}
        serviceId="service-photo-hourly"
        serviceName="Thuê phòng chụp ảnh"
      />,
    );

    expect(
      screen.getByRole("list", { name: "Các bước đặt lịch" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Thông tin liên hệ" }),
    ).toBeInTheDocument();
    expect(screen.getByText("60 phút")).toBeInTheDocument();
    expect(
      screen.getByText("500.000 ₫", { normalizer: (content) => content }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tiếp tục" })).toHaveClass(
      "ui-action--primary",
    );
  });
});
