import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageHeading } from "./page-heading";

afterEach(cleanup);

describe("PageHeading", () => {
  it("applies its heading id, optional copy and size modifier", () => {
    const { container } = render(
      <PageHeading
        eyebrow="Không gian"
        title="Chọn studio"
        description="Ba không gian chuyên biệt."
        headingId="studios-heading"
        size="large"
      />,
    );

    expect(screen.getByRole("heading", { name: "Chọn studio" })).toHaveAttribute(
      "id",
      "studios-heading",
    );
    expect(screen.getByText("Không gian")).toHaveClass("page-eyebrow");
    expect(screen.getByText("Ba không gian chuyên biệt.")).toHaveClass("page-description");
    expect(container.firstElementChild).toHaveClass("page-heading--large");
  });
});
