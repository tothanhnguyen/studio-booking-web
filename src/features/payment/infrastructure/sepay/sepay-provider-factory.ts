import { serverEnv } from "@/lib/env/server";
import { SepayProvider } from "@/features/payment/infrastructure/sepay/sepay-provider";

export function createSepayProvider() {
  return new SepayProvider({
    bankBin: serverEnv.SEPAY_BANK_BIN,
    bankAccountNumber: serverEnv.SEPAY_BANK_ACCOUNT,
    bankAccountName: serverEnv.SEPAY_ACCOUNT_NAME,
    transferPrefix: serverEnv.SEPAY_TRANSFER_PREFIX,
    webhookSecret: serverEnv.SEPAY_WEBHOOK_SECRET,
  });
}
