import type { Actor } from "@/features/auth/application/current-actor";
import { UnauthenticatedError } from "@/features/auth/application/require-role";
import type { BookingStatus } from "@/features/booking/domain/booking-types";
import type { DashboardBookingRepository } from "@/features/dashboard/application/dashboard-booking-repository";

export type BookingQueryFilters = Readonly<{
  status?: BookingStatus;
  page?: number;
  pageSize?: number;
}>;

export function normalizeBookingFilters(filters: BookingQueryFilters) {
  const page = Number.isSafeInteger(filters.page) && (filters.page ?? 0) > 0 ? filters.page! : 1;
  const requestedPageSize = Number.isSafeInteger(filters.pageSize) && (filters.pageSize ?? 0) > 0 ? filters.pageSize! : 10;
  return { ...(filters.status ? { status: filters.status } : {}), page, pageSize: Math.min(requestedPageSize, 50) };
}

export function createCustomerBookingQueries(repository: DashboardBookingRepository) {
  function requireActor(actor: Actor | null): Actor {
    if (!actor) throw new UnauthenticatedError();
    return actor;
  }

  return {
    async listCustomerBookings(actor: Actor | null, filters: BookingQueryFilters) {
      const currentActor = requireActor(actor);
      return repository.listOwned(currentActor.id, normalizeBookingFilters(filters));
    },
    async getCustomerBooking(actor: Actor | null, id: string) {
      const currentActor = requireActor(actor);
      return repository.findOwnedById(currentActor.id, id);
    },
  };
}

async function getQueries() {
  const [{ PrismaDashboardBookingRepository }, { prisma }] = await Promise.all([
    import("@/features/dashboard/infrastructure/prisma-dashboard-booking-repository"),
    import("@/lib/db/prisma"),
  ]);
  return createCustomerBookingQueries(new PrismaDashboardBookingRepository(prisma));
}

export async function listCustomerBookings(actor: Actor | null, filters: BookingQueryFilters = {}) {
  return (await getQueries()).listCustomerBookings(actor, filters);
}

export async function getCustomerBooking(actor: Actor | null, id: string) {
  return (await getQueries()).getCustomerBooking(actor, id);
}
