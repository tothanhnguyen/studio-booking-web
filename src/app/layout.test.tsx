import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import RootLayout from "./layout";

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({ variable: "font-sans-variable" }),
  IBM_Plex_Mono: () => ({ variable: "font-mono-variable" }),
  Bricolage_Grotesque: () => ({ variable: "font-display-variable" }),
}));

vi.mock("@/features/auth/application/current-actor", () => ({
  getCurrentActor: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/features/auth/application/auth-actions", () => ({
  signOutAction: vi.fn(),
}));

afterEach(cleanup);

describe("RootLayout", () => {
  it("applies the sans, mono, and display font variables to the body", async () => {
    const layout = await RootLayout({ children: <p>Content</p> });

    render(layout);

    expect(document.body).toHaveClass("font-sans-variable", "font-mono-variable", "font-display-variable");
  });
});
