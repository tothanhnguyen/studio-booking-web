import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionMarker } from "./section-marker";

describe("SectionMarker", () => {
  it("renders a zero-padded index and label", () => {
    render(<SectionMarker index={1} label="Photo Studio" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Photo Studio")).toBeInTheDocument();
  });

  it("pads two-digit indexes without truncation", () => {
    render(<SectionMarker index={12} label="Dịch vụ" />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
