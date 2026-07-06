export function PaymentStatus({
  bookingStatus,
  paymentStatus,
}: Readonly<{ bookingStatus: string; paymentStatus: string }>) {
  const description =
    paymentStatus === "PAID"
      ? "Đã nhận tiền cọc."
      : bookingStatus === "EXPIRED"
        ? "Booking đã hết hạn giữ chỗ."
        : "Đang chờ thanh toán tiền cọc.";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
      <p>
        Trạng thái booking: <strong>{bookingStatus}</strong>
      </p>
      <p className="mt-1">
        Trạng thái thanh toán: <strong>{paymentStatus}</strong>
      </p>
      <p className="mt-2 text-stone-300">{description}</p>
    </div>
  );
}
