import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ParallaxFrame } from "./parallax-frame";

function mockMatchMedia(map: Record<string, boolean>) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      matches: map[query] ?? false,
      removeEventListener: vi.fn(),
    })),
  );
}

describe("ParallaxFrame", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders children inside the frame", () => {
    mockMatchMedia({});
    render(
      <ParallaxFrame>
        <img alt="Phòng chụp" src="/media/rooms/photo-studio.webp" />
      </ParallaxFrame>,
    );
    expect(screen.getByAltText("Phòng chụp")).toBeInTheDocument();
  });

  it("does not attach scroll listeners under reduced motion", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<ParallaxFrame>ảnh</ParallaxFrame>);
    expect(addSpy).not.toHaveBeenCalledWith("scroll", expect.any(Function), expect.anything());
  });
});
