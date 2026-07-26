import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GhostIndex } from "./ghost-index";

describe("GhostIndex", () => {
  it("pads single-digit indexes to two digits", () => {
    const { container } = render(<GhostIndex index={1} />);
    expect(container.querySelector(".ghost-index")).toHaveTextContent("01");
  });

  it("keeps two-digit indexes unchanged and hides them from assistive technology", () => {
    const { container } = render(<GhostIndex index={12} />);
    const el = container.querySelector(".ghost-index");
    expect(el).toHaveTextContent("12");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });
});
