import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PaymentStatus } from "@/features/payment/presentation/payment-status";

afterEach(cleanup);

describe("PaymentStatus", () => {
  it("renders localized labels instead of raw enum values", () => {
    render(<PaymentStatus bookingStatus="PENDING_PAYMENT" paymentStatus="PENDING" />);

    expect(screen.getByText("Chờ thanh toán")).toBeInTheDocument();
    expect(screen.getAllByText("Đang chờ")).toHaveLength(1);
    expect(screen.queryByText("PENDING_PAYMENT")).not.toBeInTheDocument();
    expect(screen.queryByText("PENDING")).not.toBeInTheDocument();
  });

  it("falls back to the raw value for an unrecognized booking status", () => {
    render(<PaymentStatus bookingStatus="SOME_FUTURE_STATUS" paymentStatus="PAID" />);

    expect(screen.getByText("SOME_FUTURE_STATUS")).toBeInTheDocument();
  });
});
