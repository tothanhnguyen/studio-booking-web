import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RoomVisual } from "./room-visual";

afterEach(cleanup);

describe("RoomVisual", () => {
  it.each([
    ["photo-studio", "photo-studio.webp", "photo"],
    ["voice-podcast-booth", "voice-podcast-booth.webp", "podcast"],
    ["music-studio", "music-studio.webp", "music"],
  ] as const)(
    "renders the %s room asset with its material",
    (slug, assetName, material) => {
      render(<RoomVisual slug={slug} alt={slug} />);

      expect(screen.getByRole("img", { name: slug })).toHaveAttribute(
        "src",
        expect.stringContaining(assetName),
      );
      expect(screen.getByTestId("room-visual")).toHaveAttribute(
        "data-room-material",
        material,
      );
    },
  );

  it("uses the full hero poster and podcast material for an unknown slug", () => {
    render(<RoomVisual slug="unknown-room" alt="Unknown room" />);

    expect(screen.getByRole("img", { name: "Unknown room" })).toHaveAttribute(
      "src",
      expect.stringContaining("hero-capsules-poster.webp"),
    );
    expect(screen.getByTestId("room-visual")).toHaveAttribute(
      "data-room-material",
      "podcast",
    );
  });

  it("adds a custom class to the room visual", () => {
    render(
      <RoomVisual
        slug="photo-studio"
        alt="Photo Studio"
        className="featured-room"
      />,
    );

    expect(screen.getByTestId("room-visual")).toHaveClass(
      "room-visual",
      "featured-room",
    );
  });

  it("resolves detail variants to suffixed assets", () => {
    render(<RoomVisual alt="Chi tiết phòng" slug="music-studio" variant="detail-1" />);
    const image = screen.getByRole("img", { name: "Chi tiết phòng" });
    expect(image.getAttribute("src")).toContain("music-studio-detail-1.webp");
  });

  it("defaults to the hero asset when variant is omitted", () => {
    render(<RoomVisual alt="Phòng nhạc" slug="music-studio" />);
    const image = screen.getByRole("img", { name: "Phòng nhạc" });
    expect(image.getAttribute("src")).toContain("music-studio.webp");
  });
});
