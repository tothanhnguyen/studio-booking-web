import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Link from "next/link";

import { EmptyState } from "./empty-state";

afterEach(cleanup);

describe("EmptyState", () => {
  it("presents its title, description and optional action", () => {
    render(
      <EmptyState
        title="Chưa có booking"
        description="Chọn studio để bắt đầu."
        action={<Link href="/studios">Chọn studio</Link>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Chưa có booking" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Chọn studio để bắt đầu.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chọn studio" }).parentElement).toHaveClass(
      "empty-state__action",
    );
  });
});
