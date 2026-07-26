import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SiteFooter } from "./site-footer";

afterEach(cleanup);

describe("SiteFooter", () => {
  it("links the public studio routes and booking catalog", () => {
    render(<SiteFooter />);

    const footer = screen.getByRole("contentinfo");
    const navigation = within(footer).getByRole("navigation", {
      name: "Điều hướng chân trang",
    });

    expect(within(navigation).getByRole("link", { name: "Photo" })).toHaveAttribute(
      "href",
      "/studios/photo-studio",
    );
    expect(within(navigation).getByRole("link", { name: "Podcast" })).toHaveAttribute(
      "href",
      "/studios/voice-podcast-booth",
    );
    expect(within(navigation).getByRole("link", { name: "Music" })).toHaveAttribute(
      "href",
      "/studios/music-studio",
    );
    expect(within(footer).getByRole("link", { name: "Đặt lịch" })).toHaveAttribute(
      "href",
      "/studios",
    );
    expect(footer).toHaveTextContent("Sài Gòn · Asia/Ho_Chi_Minh");
  });
});
