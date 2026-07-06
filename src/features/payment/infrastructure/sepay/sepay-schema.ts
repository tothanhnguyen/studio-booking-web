import { z } from "zod";

const sepayWebhookSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    transaction_id: z.union([z.string(), z.number()]).optional(),
    amount: z.coerce.number().int().positive(),
    currency: z.string().trim().min(1).default("VND"),
    content: z.string().optional(),
    transfer_content: z.string().optional(),
    gateway: z.string().optional(),
    account_number: z.string().optional(),
    occurred_at: z.iso.datetime().optional(),
    created_at: z.iso.datetime().optional(),
  })
  .passthrough();

export type SepayWebhookPayload = z.infer<typeof sepayWebhookSchema>;

export function parseSepayWebhookPayload(value: unknown): SepayWebhookPayload {
  return sepayWebhookSchema.parse(value);
}
