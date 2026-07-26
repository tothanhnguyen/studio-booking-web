import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ScrollReveal } from "./scroll-reveal";

type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

let intersect: IntersectionCallback = () => {};

class MockObserver {
  constructor(callback: IntersectionCallback) {
    intersect = callback;
  }
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
}

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches,
      removeEventListener: vi.fn(),
    }),
  );
}

describe("ScrollReveal", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("always renders its children", () => {
    mockReducedMotion(false);
    render(<ScrollReveal>Nội dung</ScrollReveal>);
    expect(screen.getByText("Nội dung")).toBeInTheDocument();
  });

  it("reveals after intersection", async () => {
    mockReducedMotion(false);
    const { container } = render(<ScrollReveal>Nội dung</ScrollReveal>);
    const node = container.querySelector(".scroll-reveal");
    await waitFor(() => expect(node).toHaveAttribute("data-state", "pending"));
    intersect([{ isIntersecting: true }]);
    await waitFor(() => expect(node).toHaveAttribute("data-state", "revealed"));
  });

  it("stays revealed under reduced motion", async () => {
    mockReducedMotion(true);
    const { container } = render(<ScrollReveal>Nội dung</ScrollReveal>);
    const node = container.querySelector(".scroll-reveal");
    await waitFor(() => expect(node).toHaveAttribute("data-state", "revealed"));
  });
});
