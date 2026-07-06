import type { PaymentEventResult, PaymentRepository } from "@/features/payment/application/payment-repository";
import type { NormalizedPaymentEvent } from "@/features/payment/domain/payment-types";

export function createProcessPaymentEvent(repository: PaymentRepository) {
  return function processPaymentEvent(event: NormalizedPaymentEvent): Promise<PaymentEventResult> {
    return repository.processNormalizedEvent(event);
  };
}

async function getPaymentRepository(): Promise<PaymentRepository> {
  const [{ PrismaPaymentRepository }, { prisma }] = await Promise.all([
    import("@/features/payment/infrastructure/prisma-payment-repository"),
    import("@/lib/db/prisma"),
  ]);
  return new PrismaPaymentRepository(prisma);
}

export async function processPaymentEvent(event: NormalizedPaymentEvent): Promise<PaymentEventResult> {
  return createProcessPaymentEvent(await getPaymentRepository())(event);
}
