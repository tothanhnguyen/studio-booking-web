import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Marquee } from "./marquee";

describe("Marquee", () => {
  it("is hidden from assistive technology", () => {
    const { container } = render(<Marquee items={["Studio", "Âm nhạc"]} />);
    expect(container.querySelector(".marquee")).toHaveAttribute("aria-hidden", "true");
  });

  it("duplicates the strip for seamless looping", () => {
    const { container } = render(<Marquee items={["Studio", "Podcast"]} />);
    const spans = container.querySelectorAll(".marquee-track > span");
    expect(spans).toHaveLength(2);
    expect(spans[0]?.textContent).toBe(spans[1]?.textContent);
    expect(spans[0]?.textContent).toContain("Studio · Podcast");
  });
});
