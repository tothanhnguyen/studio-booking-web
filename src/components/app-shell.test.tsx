import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the MowStudio brand and main landmark", () => {
    render(
      <AppShell>
        <p>Nội dung thử nghiệm</p>
      </AppShell>,
    );

    expect(screen.getByText("MowStudio")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Nội dung thử nghiệm");
  });
});
