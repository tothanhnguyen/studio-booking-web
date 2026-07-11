import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

afterEach(cleanup);

describe("AppShell", () => {
  it("shows login and registration actions to guests", () => {
    render(
      <AppShell actor={null}>
        <p>Nội dung thử nghiệm</p>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "MOW STUDIO — Trang chủ" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: "Điều hướng studio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Photo" })).toHaveAttribute("href", "/studios/photo-studio");
    expect(screen.getByRole("link", { name: "Podcast" })).toHaveAttribute("href", "/studios/voice-podcast-booth");
    expect(screen.getByRole("link", { name: "Music" })).toHaveAttribute("href", "/studios/music-studio");
    expect(screen.queryByText("01")).not.toBeInTheDocument();
    expect(screen.queryByText("02")).not.toBeInTheDocument();
    expect(screen.queryByText("03")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Nội dung thử nghiệm");
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Đăng ký" })).toHaveAttribute("href", "/register");
  });

  it("shows account identity and logout to authenticated customers", () => {
    render(<AppShell actor={{ id: "customer-1", role: "CUSTOMER", email: "an@example.com", emailVerified: true }}><p>Nội dung</p></AppShell>);
    expect(screen.getByRole("link", { name: "Booking của tôi" })).toHaveAttribute("href", "/account/bookings");
    expect(screen.getByText("an@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đăng xuất" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Đăng nhập" })).not.toBeInTheDocument();
  });

  it("links administrators to the management dashboard", () => {
    render(<AppShell actor={{ id: "admin-1", role: "ADMIN", email: "admin@example.com", emailVerified: true }}><p>Nội dung</p></AppShell>);
    expect(screen.getByRole("link", { name: "Quản trị" })).toHaveAttribute("href", "/admin");
  });
});
