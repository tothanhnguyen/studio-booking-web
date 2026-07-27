import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FilmStrip } from "./film-strip";

const items = [
  { alt: "Góc phòng thu 1", src: "/a.jpg" },
  { alt: "Góc phòng thu 2", href: "/studios/a", src: "/b.jpg" },
];

afterEach(cleanup);

describe("FilmStrip", () => {
  it("renders items as a semantic list", () => {
    render(<FilmStrip items={items} />);
    const list = screen.getByRole("list");
    expect(list.children).toHaveLength(2);
  });

  it("wraps an item in a link only when href is provided", () => {
    render(<FilmStrip items={items} />);
    expect(screen.getByAltText("Góc phòng thu 1").closest("a")).toBeNull();
    expect(screen.getByAltText("Góc phòng thu 2").closest("a")).toHaveAttribute(
      "href",
      "/studios/a",
    );
  });
});
