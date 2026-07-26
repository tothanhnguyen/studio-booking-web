import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Actor } from "@/features/auth/application/current-actor";

import { AppShell } from "./app-shell";

afterEach(cleanup);

const customerActor: Actor = {
  id: "customer-1",
  role: "CUSTOMER",
  email: "an@example.com",
  emailVerified: true,
};

const adminActor: Actor = {
  id: "admin-1",
  role: "ADMIN",
  email: "admin@example.com",
  emailVerified: true,
};

const unusedSignOutAction = async () => undefined;

function renderAppShell(
  actor: Actor | null = null,
  onSignOut: () => Promise<void> = unusedSignOutAction,
) {
  return render(
    <AppShell actor={actor} onSignOut={onSignOut}>
      <p>Nội dung thử nghiệm</p>
    </AppShell>,
  );
}

describe("AppShell", () => {
  it("renders the shared shell structure", () => {
    const { container } = renderAppShell();

    expect(container.querySelector(".app-shell")).toBeInTheDocument();
    expect(container.querySelector("main.app-main")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MOW STUDIO — Trang chủ" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("main")).toHaveTextContent("Nội dung thử nghiệm");
  });

  it("shows studio, login and registration actions to guests", () => {
    renderAppShell();

    const desktopNavigation = screen.getByRole("navigation", { name: "Điều hướng studio" });
    expect(within(desktopNavigation).getByRole("link", { name: "Photo" })).toHaveAttribute(
      "href",
      "/studios/photo-studio",
    );
    expect(within(desktopNavigation).getByRole("link", { name: "Podcast" })).toHaveAttribute(
      "href",
      "/studios/voice-podcast-booth",
    );
    expect(within(desktopNavigation).getByRole("link", { name: "Music" })).toHaveAttribute(
      "href",
      "/studios/music-studio",
    );
    expect(within(desktopNavigation).getByRole("link", { name: "Đăng nhập" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(within(desktopNavigation).getByRole("link", { name: "Đăng ký" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("does not render legacy numbered navigation labels", () => {
    renderAppShell();

    expect(screen.queryByText("01")).not.toBeInTheDocument();
    expect(screen.queryByText("02")).not.toBeInTheDocument();
    expect(screen.queryByText("03")).not.toBeInTheDocument();
  });

  it("provides mobile navigation and a booking footer", () => {
    renderAppShell();

    expect(screen.getByText("Menu", { selector: "summary" })).toBeInTheDocument();
    const mobileNavigation = screen.getByRole("navigation", { name: "Điều hướng mobile" });
    expect(within(mobileNavigation).getByRole("link", { name: "Photo" })).toHaveAttribute(
      "href",
      "/studios/photo-studio",
    );
    expect(within(mobileNavigation).getByRole("link", { name: "Đăng nhập" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Asia/Ho_Chi_Minh");
    expect(screen.getByRole("link", { name: "Đặt lịch" })).toHaveAttribute("href", "/studios");
  });

  it("shows account identity and wires both responsive logout forms", async () => {
    const onSignOut = vi.fn(async () => undefined);
    renderAppShell(customerActor, onSignOut);

    const bookingLinks = screen.getAllByRole("link", { name: "Booking của tôi" });
    const logoutButtons = screen.getAllByRole("button", { name: "Đăng xuất" });
    expect(bookingLinks).toHaveLength(2);
    bookingLinks.forEach((link) => expect(link).toHaveAttribute("href", "/account/bookings"));
    expect(screen.getAllByText("an@example.com")).toHaveLength(2);
    expect(logoutButtons).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Đăng nhập" })).not.toBeInTheDocument();

    logoutButtons.forEach((button) => fireEvent.submit(button.closest("form")!));
    await waitFor(() => expect(onSignOut).toHaveBeenCalledTimes(2));
  });

  it("links administrators to the management dashboard", () => {
    renderAppShell(adminActor);

    const adminLinks = screen.getAllByRole("link", { name: "Quản trị" });
    expect(adminLinks).toHaveLength(2);
    adminLinks.forEach((link) => expect(link).toHaveAttribute("href", "/admin"));
  });
});
