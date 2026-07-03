export type VndBreakdown = Readonly<{
  depositAmount: number;
  remainingAmount: number;
}>;

export function calculateDeposit(subtotalAmount: number): VndBreakdown {
  if (!Number.isSafeInteger(subtotalAmount) || subtotalAmount < 0) {
    throw new TypeError("subtotalAmount must be a non-negative safe integer VND amount");
  }

  const depositAmount = Number(
    (BigInt(subtotalAmount) * BigInt(30) + BigInt(50)) / BigInt(100),
  );

  return {
    depositAmount,
    remainingAmount: subtotalAmount - depositAmount,
  };
}
