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

export function PaymentStatus({
  bookingStatus,
  paymentStatus,
}: Readonly<{ bookingStatus: string; paymentStatus: string }>) {
  const description = getPaymentStatusDescription(bookingStatus, paymentStatus);
  const badgeLabel = paymentStatusBadgeLabel[paymentStatus] ?? paymentStatus;

  return (
    <section
      className="payment-status ui-surface"
      data-payment-state={paymentStatus.toLowerCase()}
      aria-labelledby="payment-status-heading"
    >
      <p className="page-eyebrow">Theo dõi giao dịch</p>
      <div className="payment-status__head">
        <h2 id="payment-status-heading">Trạng thái hiện tại</h2>
        <span className="payment-status__badge">{badgeLabel}</span>
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
