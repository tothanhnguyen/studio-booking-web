import { describe, expect, it, vi } from "vitest";

import { createNotificationService } from "@/features/notification/application/notification-service";

describe("notification-service", () => {
  it("creates pending intent and marks log as SENT when provider succeeds", async () => {
    const booking = {
      id: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
      customerEmail: "guest@example.com",
      customerName: "Khách",
      serviceName: "Thuê phòng chụp ảnh",
      startTime: new Date("2027-01-15T03:00:00.000Z"),
    };
    const client = {
      booking: {
        findUnique: vi.fn().mockResolvedValue(booking),
      },
      notificationLog: {
        create: vi.fn().mockResolvedValue({ id: "log-1" }),
        findUnique: vi.fn().mockResolvedValue({ id: "log-1", status: "PENDING" }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    const provider = {
      send: vi.fn().mockResolvedValue({ providerReference: "resend-1" }),
    };
    const service = createNotificationService({
      client: client as never,
      emailProvider: provider,
    });

    await service.sendBookingNotification({
      bookingId: booking.id,
      eventType: "BOOKING_CREATED",
      causalEventId: "cause-1",
    });

    expect(client.notificationLog.create).toHaveBeenCalledTimes(1);
    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(client.notificationLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SENT" }),
      }),
    );
  });

  it("marks log FAILED when provider rejects request", async () => {
    const booking = {
      id: "11111111-1111-4111-8111-111111111111",
      userId: null,
      customerEmail: "guest@example.com",
      customerName: "Khách",
      serviceName: "Thuê phòng chụp ảnh",
      startTime: new Date("2027-01-15T03:00:00.000Z"),
    };
    const update = vi.fn().mockResolvedValue({});
    const service = createNotificationService({
      client: {
        booking: { findUnique: vi.fn().mockResolvedValue(booking) },
        notificationLog: {
          create: vi.fn().mockResolvedValue({ id: "log-1" }),
          findUnique: vi.fn().mockResolvedValue({ id: "log-1", status: "PENDING" }),
          update,
        },
      } as never,
      emailProvider: {
        send: vi.fn().mockRejectedValue(new Error("timeout")),
      },
    });

    await service.sendBookingNotification({
      bookingId: booking.id,
      eventType: "BOOKING_CANCELLED",
      causalEventId: "cause-2",
    });

    expect(update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED" }),
      }),
    );
  });
});
