import { createHash } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import type {
  NotificationEventType,
  NotificationLog,
  PrismaClient,
} from "@/generated/prisma/client";
import type { EmailProvider } from "@/features/notification/application/email-provider";
import { createBookingNotificationTemplate } from "@/features/notification/presentation/email-templates";

export type BookingNotificationIntent = Readonly<{
  bookingId: string;
  eventType: NotificationEventType;
  causalEventId: string;
}>;

export type NotificationService = Readonly<{
  sendBookingNotification(intent: BookingNotificationIntent): Promise<void>;
  queueBookingNotification(intent: BookingNotificationIntent): Promise<void>;
}>;

function maskEmail(email: string) {
  const [local, domain] = email.toLowerCase().split("@");
  if (!local || !domain) return "***";
  if (local.length <= 2) return `${local[0] ?? "*"}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

function hashRecipient(value: string) {
  return createHash("sha256").update(value.toLowerCase(), "utf8").digest("hex");
}

export function createNotificationService(input: {
  client: PrismaClient;
  emailProvider: EmailProvider;
}): NotificationService {
  const { client, emailProvider } = input;

  async function queueBookingNotification(intent: BookingNotificationIntent): Promise<void> {
    const booking = await client.booking.findUnique({
      where: { id: intent.bookingId },
      select: {
        id: true,
        userId: true,
        customerEmail: true,
      },
    });
    if (!booking) {
      throw new Error("Booking không tồn tại để tạo notification intent.");
    }

    try {
      await client.notificationLog.create({
        data: {
          bookingId: booking.id,
          userId: booking.userId,
          eventType: intent.eventType,
          channel: "EMAIL",
          recipientMasked: maskEmail(booking.customerEmail),
          recipientHash: hashRecipient(booking.customerEmail),
          causalEventId: intent.causalEventId,
          status: "PENDING",
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return;
      }
      throw error;
    }
  }

  async function sendBookingNotification(intent: BookingNotificationIntent): Promise<void> {
    await queueBookingNotification(intent);

    const log = await client.notificationLog.findUnique({
      where: {
        bookingId_eventType_causalEventId: {
          bookingId: intent.bookingId,
          eventType: intent.eventType,
          causalEventId: intent.causalEventId,
        },
      },
    });
    if (!log || log.status === "SENT") {
      return;
    }

    const booking = await client.booking.findUnique({
      where: { id: intent.bookingId },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        serviceName: true,
        startTime: true,
      },
    });
    if (!booking) {
      return;
    }

    const template = createBookingNotificationTemplate({
      eventType: intent.eventType,
      bookingId: booking.id,
      customerName: booking.customerName,
      serviceName: booking.serviceName,
      startTime: booking.startTime.toISOString(),
    });

    try {
      const result = await emailProvider.send({
        to: booking.customerEmail,
        subject: template.subject,
        html: template.html,
      });
      await client.notificationLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          attemptCount: { increment: 1 },
          providerReference: result.providerReference,
          errorSummary: null,
        },
      });
    } catch (error) {
      await markNotificationFailed(client, log, error);
    }
  }

  return {
    sendBookingNotification,
    queueBookingNotification,
  };
}

async function markNotificationFailed(
  client: PrismaClient,
  log: NotificationLog,
  error: unknown,
) {
  const message =
    error instanceof Error ? error.message.slice(0, 200) : "Email provider error";
  await client.notificationLog.update({
    where: { id: log.id },
    data: {
      status: "FAILED",
      attemptCount: { increment: 1 },
      errorSummary: message,
    },
  });
}

async function getNotificationService(): Promise<NotificationService> {
  const [{ prisma }, { ResendEmailProvider }, { serverEnv }] = await Promise.all([
    import("@/lib/db/prisma"),
    import("@/features/notification/infrastructure/resend-email-provider"),
    import("@/lib/env/server"),
  ]);
  return createNotificationService({
    client: prisma,
    emailProvider: new ResendEmailProvider({
      apiKey: serverEnv.RESEND_API_KEY,
      fromEmail: serverEnv.NOTIFICATION_FROM_EMAIL,
    }),
  });
}

export async function sendBookingNotification(intent: BookingNotificationIntent): Promise<void> {
  await (await getNotificationService()).sendBookingNotification(intent);
}

export async function queueBookingNotification(intent: BookingNotificationIntent): Promise<void> {
  await (await getNotificationService()).queueBookingNotification(intent);
}
