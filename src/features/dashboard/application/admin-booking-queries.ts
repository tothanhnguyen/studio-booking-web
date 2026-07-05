import type { Actor } from "@/features/auth/application/current-actor";
import { ForbiddenError, UnauthenticatedError } from "@/features/auth/application/require-role";
import { normalizeBookingFilters, type BookingQueryFilters } from "@/features/dashboard/application/customer-booking-queries";
import type { BookingCalendarRange, DashboardBookingRepository } from "@/features/dashboard/application/dashboard-booking-repository";

const MAX_CALENDAR_RANGE_MS = 92 * 24 * 60 * 60 * 1_000;

export function createAdminBookingQueries(repository: DashboardBookingRepository) {
  function requireAdmin(actor: Actor | null): Actor {
    if (!actor) throw new UnauthenticatedError();
    if (actor.role !== "ADMIN") throw new ForbiddenError();
    return actor;
  }

  return {
    async listAdminBookings(actor: Actor | null, filters: BookingQueryFilters) {
      requireAdmin(actor);
      return repository.listAll(normalizeBookingFilters(filters));
    },
    async getAdminBooking(actor: Actor | null, id: string) {
      requireAdmin(actor);
      return repository.findById(id);
    },
    async getAdminCalendar(actor: Actor | null, range: BookingCalendarRange) {
      requireAdmin(actor);
      const duration = range.to.getTime() - range.from.getTime();
      if (!Number.isFinite(duration) || duration <= 0) throw new RangeError("Khoảng lịch không hợp lệ.");
      if (duration > MAX_CALENDAR_RANGE_MS) throw new RangeError("Khoảng lịch tối đa 92 ngày.");
      return repository.listCalendar(range);
    },
  };
}

async function getQueries() {
  const [{ PrismaDashboardBookingRepository }, { prisma }] = await Promise.all([
    import("@/features/dashboard/infrastructure/prisma-dashboard-booking-repository"),
    import("@/lib/db/prisma"),
  ]);
  return createAdminBookingQueries(new PrismaDashboardBookingRepository(prisma));
}

export async function listAdminBookings(actor: Actor | null, filters: BookingQueryFilters = {}) {
  return (await getQueries()).listAdminBookings(actor, filters);
}

export async function getAdminBooking(actor: Actor | null, id: string) {
  return (await getQueries()).getAdminBooking(actor, id);
}

export async function getAdminCalendar(actor: Actor | null, range: BookingCalendarRange) {
  return (await getQueries()).getAdminCalendar(actor, range);
}
