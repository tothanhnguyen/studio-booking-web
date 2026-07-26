import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyPaymentValue } from "./copy-payment-value";

function setClipboard(writeText: (value: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CopyPaymentValue", () => {
  it("copies the value and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    render(<CopyPaymentValue label="Số tài khoản" value="0123456789" />);

    fireEvent.click(screen.getByRole("button", { name: "Sao chép Số tài khoản" }));

    expect(writeText).toHaveBeenCalledWith("0123456789");
    expect(await screen.findByRole("status")).toHaveTextContent("Đã sao chép");
  });

  it("announces a rejected clipboard write", async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error("Clipboard denied")));
    render(<CopyPaymentValue label="Nội dung chuyển khoản" value="BOOKING:123" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Sao chép Nội dung chuyển khoản" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent("Không thể sao chép");
  });

  it("resets feedback after 2000ms", async () => {
    vi.useFakeTimers();
    setClipboard(vi.fn().mockResolvedValue(undefined));
    render(<CopyPaymentValue label="Số tài khoản" value="0123456789" />);

    fireEvent.click(screen.getByRole("button", { name: "Sao chép Số tài khoản" }));
    await act(async () => Promise.resolve());
    expect(screen.getByRole("status")).toHaveTextContent("Đã sao chép");

    act(() => vi.advanceTimersByTime(2_000));

    expect(screen.getByRole("status")).toHaveTextContent("Sao chép");
  });

  it("replaces rapid-click timers and clears the active timer on unmount", async () => {
    vi.useFakeTimers();
    setClipboard(vi.fn().mockResolvedValue(undefined));
    const { unmount } = render(
      <CopyPaymentValue label="Số tài khoản" value="0123456789" />,
    );
    const button = screen.getByRole("button", { name: "Sao chép Số tài khoản" });

    fireEvent.click(button);
    await act(async () => Promise.resolve());
    fireEvent.click(button);
    await act(async () => Promise.resolve());

    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
