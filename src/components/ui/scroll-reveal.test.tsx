import { act, render, screen, waitFor } from "@testing-library/react";
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
    // Simulate the element starting below the fold (real ScrollReveal usage) so the
    // mount-time "already visible" shortcut doesn't short-circuit the observer path.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 2100,
      height: 100,
      left: 0,
      right: 0,
      toJSON: () => {},
      top: 2000,
      width: 0,
      x: 0,
      y: 2000,
    } as DOMRect);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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

  it("force-reveals via the failsafe timer if the observer never fires", async () => {
    vi.useFakeTimers();
    mockReducedMotion(false);
    const { container } = render(<ScrollReveal>Nội dung</ScrollReveal>);
    const node = container.querySelector(".scroll-reveal");
    expect(node).toHaveAttribute("data-state", "pending");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(node).toHaveAttribute("data-state", "revealed");

    vi.useRealTimers();
  });
});
