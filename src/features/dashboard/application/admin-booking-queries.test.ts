import { describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "@/features/auth/application/require-role";
import { createAdminBookingQueries } from "@/features/dashboard/application/admin-booking-queries";

const page = { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 };

describe("admin booking queries", () => {
  it("denies customer actors before touching the repository", async () => {
    const repository = {
      listAll: vi.fn(), findById: vi.fn(), listCalendar: vi.fn(),
      listOwned: vi.fn(), findOwnedById: vi.fn(),
    };
    const queries = createAdminBookingQueries(repository);
    await expect(queries.listAdminBookings({ id: "customer-1", role: "CUSTOMER" }, {})).rejects.toBeInstanceOf(ForbiddenError);
    expect(repository.listAll).not.toHaveBeenCalled();
  });

  it("passes bounded filters and a valid half-open UTC calendar range", async () => {
    const repository = {
      listAll: vi.fn().mockResolvedValue(page), findById: vi.fn(), listCalendar: vi.fn().mockResolvedValue([]),
      listOwned: vi.fn(), findOwnedById: vi.fn(),
    };
    const queries = createAdminBookingQueries(repository);
    const admin = { id: "admin-1", role: "ADMIN" as const };

    await queries.listAdminBookings(admin, { status: "PENDING", page: 0, pageSize: 100 });
    await queries.getAdminCalendar(admin, { from: new Date("2027-05-01T00:00:00.000Z"), to: new Date("2027-06-01T00:00:00.000Z") });

    expect(repository.listAll).toHaveBeenCalledWith({ status: "PENDING", page: 1, pageSize: 50 });
    expect(repository.listCalendar).toHaveBeenCalledWith({ from: new Date("2027-05-01T00:00:00.000Z"), to: new Date("2027-06-01T00:00:00.000Z") });
  });

  it("rejects inverted or oversized calendar ranges", async () => {
    const repository = {
      listAll: vi.fn(), findById: vi.fn(), listCalendar: vi.fn(),
      listOwned: vi.fn(), findOwnedById: vi.fn(),
    };
    const queries = createAdminBookingQueries(repository);
    const admin = { id: "admin-1", role: "ADMIN" as const };
    await expect(queries.getAdminCalendar(admin, { from: new Date("2027-06-01"), to: new Date("2027-05-01") })).rejects.toThrow("Khoảng lịch không hợp lệ");
    await expect(queries.getAdminCalendar(admin, { from: new Date("2027-01-01"), to: new Date("2028-01-02") })).rejects.toThrow("tối đa 92 ngày");
  });
});
