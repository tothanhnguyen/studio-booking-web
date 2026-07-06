import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  DIRECT_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  NEXT_PUBLIC_SUPABASE_URL: z.url({ protocol: /^https?$/ }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  APP_URL: z.url({ protocol: /^https?$/ }),
  SEPAY_BANK_BIN: z.string().trim().min(1).default("970422"),
  SEPAY_BANK_ACCOUNT: z.string().trim().min(1).default("0123456789"),
  SEPAY_ACCOUNT_NAME: z.string().trim().min(1).default("Mow Studio"),
  SEPAY_TRANSFER_PREFIX: z.string().trim().min(1).default("BOOKING:"),
  SEPAY_WEBHOOK_SECRET: z.string().trim().optional(),
  RESEND_API_KEY: z.string().trim().optional(),
  NOTIFICATION_FROM_EMAIL: z.email().default("no-reply@mowstudio.local"),
});

export function parseServerEnv(environment: NodeJS.ProcessEnv) {
  return serverEnvSchema.parse({
    DATABASE_URL: environment.DATABASE_URL,
    DIRECT_URL: environment.DIRECT_URL,
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: environment.SUPABASE_SERVICE_ROLE_KEY,
    APP_URL: environment.APP_URL,
    SEPAY_BANK_BIN: environment.SEPAY_BANK_BIN,
    SEPAY_BANK_ACCOUNT: environment.SEPAY_BANK_ACCOUNT,
    SEPAY_ACCOUNT_NAME: environment.SEPAY_ACCOUNT_NAME,
    SEPAY_TRANSFER_PREFIX: environment.SEPAY_TRANSFER_PREFIX,
    SEPAY_WEBHOOK_SECRET: environment.SEPAY_WEBHOOK_SECRET,
    RESEND_API_KEY: environment.RESEND_API_KEY,
    NOTIFICATION_FROM_EMAIL: environment.NOTIFICATION_FROM_EMAIL,
  });
}
