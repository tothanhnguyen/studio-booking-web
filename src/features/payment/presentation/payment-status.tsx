import { LedStatus, type LedStatusProps } from "@/components/ui/led-status";

export function getPaymentStatusDescription(
  bookingStatus: string,
  paymentStatus: string,
) {
  return paymentStatus === "PAID"
    ? "Đã nhận tiền cọc."
    : bookingStatus === "EXPIRED"
      ? "Booking đã hết hạn giữ chỗ."
      : "Đang chờ thanh toán tiền cọc.";
}

const bookingStatusLabel: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
  COMPLETED: "Đã hoàn thành",
};

const paymentStatusBadgeLabel: Record<string, string> = {
  PENDING: "Đang chờ",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  EXPIRED: "Hết hạn",
};

const paymentStatusTone: Record<string, LedStatusProps["tone"]> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "danger",
  EXPIRED: "neutral",
};

export function PaymentStatus({
  bookingStatus,
  paymentStatus,
  demoMode = false,
}: Readonly<{ bookingStatus: string; paymentStatus: string; demoMode?: boolean }>) {
  const description = getPaymentStatusDescription(bookingStatus, paymentStatus);
  const badgeLabel = paymentStatusBadgeLabel[paymentStatus] ?? paymentStatus;
  const badgeTone = paymentStatusTone[paymentStatus] ?? "neutral";

  return (
    <section
      className="payment-status ui-surface"
      data-payment-state={paymentStatus.toLowerCase()}
      aria-labelledby="payment-status-heading"
    >
      <p className="page-eyebrow">Theo dõi giao dịch{demoMode ? " · Demo" : ""}</p>
      <div className="payment-status__row">
        <h2 id="payment-status-heading">Trạng thái hiện tại</h2>
        <LedStatus label={badgeLabel} tone={badgeTone} />
      </div>
      <dl>
        <div>
          <dt>Trạng thái booking:</dt>
          <dd className="type-mono">{bookingStatusLabel[bookingStatus] ?? bookingStatus}</dd>
        </div>
      </dl>
      <p className="payment-status__description">{description}</p>
    </section>
  );
}
