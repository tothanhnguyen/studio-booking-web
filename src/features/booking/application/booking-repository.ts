import type { BookingStatus, BookingType } from "@/features/booking/domain/booking-types";

export type BookingRecord = Readonly<{
  id: string;
  roomId: string;
  serviceId: string;
  bookingType: BookingType;
  bookingStatus: BookingStatus;
  startTime: Date;
  endTime: Date;
  bufferEndTime: Date;
}>;

export interface BookingRepository {
  findById(id: string): Promise<BookingRecord | null>;
}
