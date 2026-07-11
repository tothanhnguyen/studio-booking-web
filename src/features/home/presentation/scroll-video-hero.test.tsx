import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ScrollVideoHero } from "./scroll-video-hero";

beforeEach(() => {
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ScrollVideoHero", () => {
  it("renders three complete HTML states and their actions", () => {
    render(<ScrollVideoHero />);

    expect(screen.getByRole("heading", { name: "MOW STUDIO" })).toBeInTheDocument();
    expect(document.querySelectorAll("[data-hero-wordmark-letter]")).toHaveLength(3);
    expect(
      screen.getByRole("heading", { name: "Nơi ý tưởng bước ra khỏi bản nháp." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mỗi ý tưởng cần một không gian vừa vặn" })).toBeInTheDocument();
    expect(
      screen.getByText(/Chọn một không gian để xem thiết bị/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đặt lịch" })).toHaveAttribute("href", "/studios");
    expect(screen.getByRole("link", { name: "Xem không gian" })).toHaveAttribute("href", "/studios");
    expect(screen.getByRole("link", { name: /Photo — Chụp sản phẩm/ })).toHaveAttribute(
      "href",
      "/studios/photo-studio",
    );
    expect(screen.getByRole("link", { name: /Podcast — Thu âm/ })).toHaveAttribute(
      "href",
      "/studios/voice-podcast-booth",
    );
    expect(screen.getByRole("link", { name: /Music — Sản xuất/ })).toHaveAttribute(
      "href",
      "/studios/music-studio",
    );
    expect(screen.getByRole("link", { name: "Xem lịch trống" })).toHaveAttribute("href", "/studios");
  });

  it("uses exactly three viewport lengths on desktop", () => {
    const { container } = render(<ScrollVideoHero />);

    expect(container.querySelector("[data-scroll-canvas-section]")).toHaveClass("md:min-h-[300vh]");
    expect(container.querySelectorAll("[data-hero-state]")).toHaveLength(3);
  });

  it("renders a poster fallback without any video element", () => {
    const { container } = render(<ScrollVideoHero />);

    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Ba không gian Photo, Podcast và Music của MowStudio" }),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("hero-capsules-poster.webp"),
    );
    expect(screen.getByText("Scroll để khám phá")).toBeInTheDocument();
  });

  it("renders a static poster when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { container } = render(<ScrollVideoHero />);

    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Ba không gian Photo, Podcast và Music của MowStudio" }),
    ).toBeInTheDocument();
  });
});
