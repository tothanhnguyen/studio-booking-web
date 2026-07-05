import { z } from "zod";

export const createBookingCommandSchema = z.object({
  serviceId: z.uuid(), startTime: z.iso.datetime(),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.email(), customerPhone: z.string().trim().min(8).max(20).optional(),
  note: z.string().trim().max(1000).optional(),
});

export type CreateBookingCommand = z.infer<typeof createBookingCommandSchema>;
export type CreatedBookingAccess = Readonly<{ bookingId: string; guestToken: string; holdExpiresAt: string }>;
export type PersistedBookingHold = Readonly<{ bookingId: string; holdExpiresAt: string }>;

export interface BookingCommandRepository {
  createHold(command: CreateBookingCommand, guestTokenHash: string, now: Date): Promise<PersistedBookingHold>;
}
