import type { BookingType } from "@/features/booking/domain/booking-types";

export type ServiceRecord = Readonly<{
  id: string;
  roomId: string;
  name: string;
  slug: string;
  description: string | null;
  bookingType: BookingType;
  durationMinutes: number;
  bufferMinutes: number;
  priceAmount: number;
  currency: string;
  isActive: boolean;
  displayOrder: number;
}>;

export interface ServiceRepository {
  findActiveById(id: string): Promise<ServiceRecord | null>;
  findActiveBySlug(slug: string): Promise<ServiceRecord | null>;
  listByRoom(roomId: string): Promise<ServiceRecord[]>;
}
