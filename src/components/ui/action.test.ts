import { describe, expect, it } from "vitest";

import { actionClassName } from "./action";

describe("actionClassName", () => {
  it("builds default and compact variant class names", () => {
    expect(actionClassName()).toBe("ui-action ui-action--primary");
    expect(actionClassName("danger", true)).toBe(
      "ui-action ui-action--danger ui-action--compact",
    );
  });
});
