import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BookingProgress } from "./booking-progress";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("BookingProgress", () => {
  it("identifies complete, active, and upcoming booking steps", () => {
    const steps = ["Liên hệ", "Ngày", "Khung giờ", "Xác nhận", "Giữ chỗ"] as const;

    render(<BookingProgress currentStep={2} steps={steps} />);

    expect(screen.getByRole("list", { name: "Các bước đặt lịch" })).toBeInTheDocument();
    expect(screen.getByText("Khung giờ").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Liên hệ").closest("li")).toHaveAttribute("data-step-state", "completed");
    expect(screen.getByText("Xác nhận").closest("li")).toHaveAttribute("data-step-state", "future");
  });

  it("keeps positional steps uniquely keyed when labels repeat", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<BookingProgress currentStep={1} steps={["Ngày", "Ngày"]} />);

    expect(screen.getAllByText("Ngày")).toHaveLength(2);
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("same key");
  });

  it("marks completed, active, and future steps on the rail", () => {
    render(<BookingProgress currentStep={1} steps={["Chọn giờ", "Thông tin", "Xác nhận"]} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-step-state", "completed");
    expect(items[1]).toHaveAttribute("data-step-state", "active");
    expect(items[2]).toHaveAttribute("data-step-state", "future");
  });
});
