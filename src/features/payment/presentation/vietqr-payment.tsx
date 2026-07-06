const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function VietQrPayment({
  amount,
  accountName,
  accountNumber,
  bankBin,
  transferContent,
  qrImageUrl,
}: Readonly<{
  amount: number;
  accountName: string;
  accountNumber: string;
  bankBin: string;
  transferContent: string;
  qrImageUrl: string;
}>) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="text-2xl font-semibold">Chuyển khoản VietQR</h2>
      <p className="mt-2 text-stone-300">
        Bạn có thể quét mã QR hoặc nhập tay thông tin bên dưới.
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-[220px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element -- QR image URL comes from provider and is not a static asset */}
        <img
          src={qrImageUrl}
          alt="Mã VietQR thanh toán tiền cọc"
          className="h-[220px] w-[220px] rounded-2xl border border-white/10 bg-white p-2"
        />
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-stone-400">Số tiền</dt>
            <dd className="font-semibold text-amber-300">{money.format(amount)}</dd>
          </div>
          <div>
            <dt className="text-stone-400">Ngân hàng (BIN)</dt>
            <dd>{bankBin}</dd>
          </div>
          <div>
            <dt className="text-stone-400">Số tài khoản</dt>
            <dd>{accountNumber}</dd>
          </div>
          <div>
            <dt className="text-stone-400">Chủ tài khoản</dt>
            <dd>{accountName}</dd>
          </div>
          <div>
            <dt className="text-stone-400">Nội dung chuyển khoản</dt>
            <dd className="font-semibold">{transferContent}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
