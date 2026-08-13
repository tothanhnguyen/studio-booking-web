import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CropFrame } from "./crop-frame";

describe("CropFrame", () => {
  it("renders children inside the frame", () => {
    render(
      <CropFrame>
        {/* The fixture intentionally uses a raw image element to test child rendering. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Phòng thu âm" src="/room.jpg" />
      </CropFrame>,
    );
    expect(screen.getByAltText("Phòng thu âm")).toBeInTheDocument();
  });

  it("hides crop marks from assistive technology", () => {
    const { container } = render(<CropFrame>content</CropFrame>);
    expect(container.querySelector(".crop-frame__marks")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an annotation strip only when provided", () => {
    const { container, rerender } = render(<CropFrame>content</CropFrame>);
    expect(container.querySelector(".proof-annotation")).not.toBeInTheDocument();

    rerender(<CropFrame annotation="FRAME 01 — PHOTO STUDIO">content</CropFrame>);
    expect(screen.getByText("FRAME 01 — PHOTO STUDIO")).toBeInTheDocument();
  });
});
