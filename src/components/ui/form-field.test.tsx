import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormField } from "./form-field";

afterEach(cleanup);

describe("FormField", () => {
  it("labels its control and presents a hint", () => {
    render(
      <FormField label="Email" htmlFor="email" hint="Dùng email nhận xác nhận booking.">
        <input id="email" />
      </FormField>,
    );

    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Dùng email nhận xác nhận booking.",
    );
    expect(screen.getByText("Dùng email nhận xác nhận booking.")).toHaveClass("ui-field__hint");
  });

  it("announces an error instead of the hint", () => {
    render(
      <FormField
        label="Email"
        htmlFor="email"
        hint="Dùng email nhận xác nhận booking."
        error="Email không hợp lệ"
      >
        <input id="email" />
      </FormField>,
    );

    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Email không hợp lệ");
    expect(screen.getByRole("alert")).toHaveTextContent("Email không hợp lệ");
    expect(screen.queryByText("Dùng email nhận xác nhận booking.")).not.toBeInTheDocument();
  });

  it("preserves an existing accessible description", () => {
    render(
      <>
        <FormField label="Email" htmlFor="email" hint="Dùng email nhận xác nhận booking.">
          <input id="email" aria-describedby="account-context" />
        </FormField>
        <p id="account-context">Email tài khoản hiện tại.</p>
      </>,
    );

    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Email tài khoản hiện tại. Dùng email nhận xác nhận booking.",
    );
  });
});
