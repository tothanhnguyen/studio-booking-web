const BANK_TRANSFER_BASE_URL = "https://img.vietqr.io/image";

export function buildVietQrImageUrl(input: {
  bankBin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
}) {
  const accountName = encodeURIComponent(input.accountName);
  const transferContent = encodeURIComponent(input.transferContent);
  return `${BANK_TRANSFER_BASE_URL}/${input.bankBin}-${input.accountNumber}-compact2.png?amount=${input.amount}&addInfo=${transferContent}&accountName=${accountName}`;
}
