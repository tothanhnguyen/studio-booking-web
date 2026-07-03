import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  DIRECT_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  NEXT_PUBLIC_SUPABASE_URL: z.url({ protocol: /^https?$/ }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  APP_URL: z.url({ protocol: /^https?$/ }),
});

export function parseServerEnv(environment: NodeJS.ProcessEnv) {
  return serverEnvSchema.parse({
    DATABASE_URL: environment.DATABASE_URL,
    DIRECT_URL: environment.DIRECT_URL,
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: environment.SUPABASE_SERVICE_ROLE_KEY,
    APP_URL: environment.APP_URL,
  });
}
