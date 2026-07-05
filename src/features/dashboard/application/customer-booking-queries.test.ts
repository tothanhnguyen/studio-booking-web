import { describe, expect, it, vi } from "vitest";

import { UnauthenticatedError } from "@/features/auth/application/require-role";
import { createCustomerBookingQueries } from "@/features/dashboard/application/customer-booking-queries";

const page = { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 };

describe("customer booking queries", () => {
  it("always scopes list and detail queries to the current owner", async () => {
    const repository = {
      listOwned: vi.fn().mockResolvedValue(page),
      findOwnedById: vi.fn().mockResolvedValue(null),
      listAll: vi.fn(), findById: vi.fn(), listCalendar: vi.fn(),
    };
    const queries = createCustomerBookingQueries(repository);
    const actor = { id: "customer-1", role: "CUSTOMER" as const };

    await queries.listCustomerBookings(actor, { status: "CONFIRMED", page: 2, pageSize: 20 });
    await queries.getCustomerBooking(actor, "booking-2");

    expect(repository.listOwned).toHaveBeenCalledWith("customer-1", { status: "CONFIRMED", page: 2, pageSize: 20 });
    expect(repository.findOwnedById).toHaveBeenCalledWith("customer-1", "booking-2");
  });

  it("rejects guests and clamps unsafe pagination", async () => {
    const repository = {
      listOwned: vi.fn().mockResolvedValue(page), findOwnedById: vi.fn(),
      listAll: vi.fn(), findById: vi.fn(), listCalendar: vi.fn(),
    };
    const queries = createCustomerBookingQueries(repository);
    await expect(queries.listCustomerBookings(null, {})).rejects.toBeInstanceOf(UnauthenticatedError);
    await queries.listCustomerBookings({ id: "customer-1", role: "CUSTOMER" }, { page: -4, pageSize: 500 });
    expect(repository.listOwned).toHaveBeenLastCalledWith("customer-1", { page: 1, pageSize: 50 });
  });
});
