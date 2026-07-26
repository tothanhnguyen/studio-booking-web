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

export function PaymentStatus({
  bookingStatus,
  paymentStatus,
}: Readonly<{ bookingStatus: string; paymentStatus: string }>) {
  const description = getPaymentStatusDescription(bookingStatus, paymentStatus);

  return (
    <section
      className="payment-status ui-surface"
      data-payment-state={paymentStatus.toLowerCase()}
      aria-labelledby="payment-status-heading"
    >
      <p className="page-eyebrow">Theo dõi giao dịch</p>
      <h2 id="payment-status-heading">Trạng thái hiện tại</h2>
      <dl>
        <div>
          <dt>Trạng thái booking:</dt>
          <dd className="type-mono">{bookingStatus}</dd>
        </div>
        <div>
          <dt>Trạng thái thanh toán:</dt>
          <dd className="type-mono">{paymentStatus}</dd>
        </div>
      </dl>
      <p className="payment-status__description">{description}</p>
    </section>
  );
}
