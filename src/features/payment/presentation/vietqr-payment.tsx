import { CropFrame } from "@/components/ui/crop-frame";

import { CopyPaymentValue } from "./copy-payment-value";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function VietQrPayment({
  amount,
  remainingAmount,
  accountName,
  accountNumber,
  bankBin,
  transferContent,
  qrImageUrl,
  demoMode = false,
}: Readonly<{
  amount: number;
  remainingAmount: number;
  accountName: string;
  accountNumber: string;
  bankBin: string;
  transferContent: string;
  qrImageUrl: string;
  demoMode?: boolean;
}>) {
  const totalAmount = amount + remainingAmount;

  return (
    <section className="payment-qr" aria-labelledby="vietqr-heading">
      <p className="page-eyebrow">Tiền cọc 30%{demoMode ? " · Demo" : ""}</p>
      <h2 id="vietqr-heading">{demoMode ? "Mô phỏng thanh toán" : "Chuyển khoản VietQR"}</h2>
      <p className="payment-qr__intro">
        {demoMode
          ? "Đây là môi trường demo. Admin sẽ xác nhận thanh toán trong trang quản trị."
          : "Bạn có thể quét mã QR hoặc nhập tay thông tin bên dưới."}
      </p>

      <div className="payment-qr__group">
        {!demoMode && (
          <>
            <div className="payment-qr__image-frame ui-surface">
              <CropFrame>
                {/* eslint-disable-next-line @next/next/no-img-element -- QR image URL comes from provider and is not a static asset */}
                <img
                  src={qrImageUrl}
                  alt="Mã VietQR thanh toán tiền cọc"
                  className="payment-qr__image"
                />
              </CropFrame>
            </div>

            <div className="payment-ledger ui-surface">
              <CopyPaymentValue label="Ngân hàng (BIN)" value={bankBin} />
              <CopyPaymentValue label="Chủ tài khoản" value={accountName} />
              <CopyPaymentValue label="Số tài khoản" value={accountNumber} />
              <CopyPaymentValue label="Nội dung chuyển khoản" value={transferContent} />
            </div>
          </>
        )}

        {demoMode && (
          <div className="payment-ledger ui-surface">
            <p className="payment-qr__intro">
              Không có giao dịch ngân hàng thật trong bản demo. Admin dùng nút xác nhận ở trang
              quản trị để hoàn tất flow.
            </p>
          </div>
        )}

        <dl className="payment-ledger ui-surface">
          <div className="ticket-stub__row">
            <dt>Tiền cọc (thanh toán ngay)</dt>
            <dd className="type-mono">{money.format(amount)}</dd>
          </div>
          <div className="ticket-stub__row">
            <dt>Tổng giá trị đặt phòng</dt>
            <dd className="type-mono">{money.format(totalAmount)}</dd>
          </div>
          <div className="ticket-stub__row payment-ledger__remaining">
            <dt>Số tiền còn lại</dt>
            <dd className="type-mono">{money.format(remainingAmount)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
