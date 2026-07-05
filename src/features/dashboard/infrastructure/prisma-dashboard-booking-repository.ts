import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type {
  BookingCalendarRange,
  BookingListFilters,
  BookingPage,
  DashboardBooking,
  DashboardBookingRepository,
} from "@/features/dashboard/application/dashboard-booking-repository";

const dashboardBookingSelect = {
  id: true, customerName: true, customerEmail: true, customerPhone: true, note: true,
  roomName: true, serviceName: true, bookingType: true, startTime: true, endTime: true,
  subtotalAmount: true, depositAmount: true, remainingAmount: true, currency: true,
  bookingStatus: true, paymentStatus: true, refundStatus: true, createdAt: true,
} satisfies Prisma.BookingSelect;

type BookingRow = Prisma.BookingGetPayload<{ select: typeof dashboardBookingSelect }>;

function mapBooking(row: BookingRow): DashboardBooking {
  return {
    ...row,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export class PrismaDashboardBookingRepository implements DashboardBookingRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: string) {
    const row = await this.client.booking.findUnique({ where: { id }, select: dashboardBookingSelect });
    return row ? mapBooking(row) : null;
  }

  async findOwnedById(userId: string, id: string) {
    const row = await this.client.booking.findFirst({ where: { id, userId }, select: dashboardBookingSelect });
    return row ? mapBooking(row) : null;
  }

  listAll(filters: BookingListFilters) {
    return this.listPage(filters.status ? { bookingStatus: filters.status } : {}, filters);
  }

  listOwned(userId: string, filters: BookingListFilters) {
    return this.listPage({ userId, ...(filters.status ? { bookingStatus: filters.status } : {}) }, filters);
  }

  async listCalendar(range: BookingCalendarRange) {
    const rows = await this.client.booking.findMany({
      where: { startTime: { lt: range.to }, endTime: { gt: range.from } },
      orderBy: [{ startTime: "asc" }, { createdAt: "asc" }],
      select: dashboardBookingSelect,
    });
    return rows.map(mapBooking);
  }

  private async listPage(where: Prisma.BookingWhereInput, filters: BookingListFilters): Promise<BookingPage> {
    const [rows, total] = await Promise.all([
      this.client.booking.findMany({
        where,
        orderBy: [{ startTime: "desc" }, { createdAt: "desc" }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        select: dashboardBookingSelect,
      }),
      this.client.booking.count({ where }),
    ]);
    return { items: rows.map(mapBooking), page: filters.page, pageSize: filters.pageSize, total, totalPages: Math.ceil(total / filters.pageSize) };
  }
}
