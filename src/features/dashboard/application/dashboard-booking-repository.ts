import type { BookingStatus } from "@/features/booking/domain/booking-types";

export type DashboardBooking = Readonly<{
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  note: string | null;
  roomName: string;
  serviceName: string;
  bookingType: "ROOM_ONLY" | "ASSISTED";
  startTime: string;
  endTime: string;
  subtotalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  currency: string;
  bookingStatus: BookingStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  refundStatus: "NONE" | "REQUESTED" | "PROCESSING" | "REFUNDED" | "REJECTED";
  createdAt: string;
}>;

export type BookingListFilters = Readonly<{
  status?: BookingStatus;
  page: number;
  pageSize: number;
}>;

export type BookingPage = Readonly<{
  items: DashboardBooking[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}>;

export type BookingCalendarRange = Readonly<{
  from: Date;
  to: Date;
}>;

export interface DashboardBookingRepository {
  findById(id: string): Promise<DashboardBooking | null>;
  findOwnedById(userId: string, id: string): Promise<DashboardBooking | null>;
  listAll(filters: BookingListFilters): Promise<BookingPage>;
  listCalendar(range: BookingCalendarRange): Promise<DashboardBooking[]>;
  listOwned(userId: string, filters: BookingListFilters): Promise<BookingPage>;
}
