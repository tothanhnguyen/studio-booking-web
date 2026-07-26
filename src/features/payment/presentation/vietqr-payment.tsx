import { CopyPaymentValue } from "./copy-payment-value";

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
    <section className="payment-qr ui-surface" aria-labelledby="vietqr-heading">
      <p className="page-eyebrow">Tiền cọc 30%</p>
      <h2 id="vietqr-heading">Chuyển khoản VietQR</h2>
      <p className="payment-qr__intro">
        Bạn có thể quét mã QR hoặc nhập tay thông tin bên dưới.
      </p>
      <div className="payment-qr__body">
        <div className="payment-qr__image-frame">
          {/* eslint-disable-next-line @next/next/no-img-element -- QR image URL comes from provider and is not a static asset */}
          <img
            src={qrImageUrl}
            alt="Mã VietQR thanh toán tiền cọc"
            className="payment-qr__image"
          />
        </div>
        <div className="payment-transfer">
          <dl className="payment-transfer__meta">
            <div>
              <dt>Số tiền</dt>
              <dd className="type-mono payment-transfer__amount">{money.format(amount)}</dd>
            </div>
            <div>
              <dt>Ngân hàng (BIN)</dt>
              <dd className="type-mono">{bankBin}</dd>
            </div>
            <div>
              <dt>Chủ tài khoản</dt>
              <dd className="type-mono">{accountName}</dd>
            </div>
          </dl>
          <div className="payment-transfer__copies">
            <CopyPaymentValue label="Số tài khoản" value={accountNumber} />
            <CopyPaymentValue label="Nội dung chuyển khoản" value={transferContent} />
          </div>
        </div>
      </div>
    </section>
  );
}
