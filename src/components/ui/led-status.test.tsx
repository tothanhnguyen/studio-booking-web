import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LedStatus } from "./led-status";

describe("LedStatus", () => {
  it("always renders the text label", () => {
    render(<LedStatus label="Đã xác nhận" tone="success" />);
    expect(screen.getByText("Đã xác nhận")).toBeInTheDocument();
  });

  it("hides the dot from assistive technology", () => {
    const { container } = render(<LedStatus label="Đang ghi" tone="record" />);
    expect(container.querySelector(".led-status__dot")).toHaveAttribute("aria-hidden", "true");
  });

  it("marks the tone on the root element", () => {
    const { container } = render(<LedStatus label="Đang chờ" tone="warning" />);
    expect(container.querySelector(".led-status")).toHaveAttribute("data-tone", "warning");
  });
});
