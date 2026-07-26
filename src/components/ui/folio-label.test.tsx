import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FolioLabel } from "./folio-label";

describe("FolioLabel", () => {
  it("renders the folio text", () => {
    render(<FolioLabel text="MOW · PROOF 01/03" />);
    expect(screen.getByText("MOW · PROOF 01/03")).toBeInTheDocument();
  });
});
