import type { NotificationEventType } from "@/generated/prisma/client";

export function createBookingNotificationTemplate(input: {
  eventType: NotificationEventType;
  bookingId: string;
  customerName: string;
  serviceName: string;
  startTime: string;
}) {
  const title = eventTitle[input.eventType];
  const formattedStartTime = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(input.startTime));

  return {
    subject: `[MowStudio] ${title} #${input.bookingId.slice(0, 8)}`,
    html: `<div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.6;">
      <h2>${title}</h2>
      <p>Xin chào ${escapeHtml(input.customerName)},</p>
      <p>Booking cho dịch vụ <strong>${escapeHtml(input.serviceName)}</strong> vào <strong>${escapeHtml(formattedStartTime)}</strong> đã được cập nhật.</p>
      <p>Mã booking: <strong>${escapeHtml(input.bookingId)}</strong></p>
      <p>Cảm ơn bạn đã sử dụng MowStudio.</p>
    </div>`,
  };
}

const eventTitle: Record<NotificationEventType, string> = {
  BOOKING_CREATED: "Đã tạo giữ chỗ",
  PAYMENT_SUCCEEDED: "Đã nhận tiền cọc",
  BOOKING_CONFIRMED: "Booking đã xác nhận",
  BOOKING_CANCELLED: "Booking đã hủy",
  LATE_PAYMENT_REVIEW: "Thanh toán trễ cần đối soát",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
