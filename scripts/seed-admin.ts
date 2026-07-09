import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { PrismaClient } from "../src/generated/prisma/client";
import { parseServerEnv } from "../src/lib/env/server-schema";

const DEFAULT_ADMIN_EMAIL = "admin@mowstudio.local";
const DEFAULT_DEV_PASSWORD = "admin-dev-12345";

function isLocalAppUrl(appUrl: string): boolean {
  return appUrl.includes("localhost") || appUrl.includes("127.0.0.1");
}

/**
 * Resolve admin password: explicit ADMIN_PASSWORD wins; otherwise a dev default
 * is only allowed when APP_URL points at localhost. Non-local targets must set
 * ADMIN_PASSWORD explicitly.
 */
function resolvePassword(appUrl: string): string {
  const explicit = process.env.ADMIN_PASSWORD?.trim();
  if (explicit) return explicit;

  if (isLocalAppUrl(appUrl)) {
    console.warn(
      "⚠️  ADMIN_PASSWORD chưa set — dùng mật khẩu dev mặc định vì APP_URL là localhost. KHÔNG dùng ngoài local.",
    );
    return DEFAULT_DEV_PASSWORD;
  }

  throw new Error("ADMIN_PASSWORD bắt buộc khi APP_URL không phải localhost.");
}

/**
 * Find an existing Supabase auth user id by email (paginated) — used when
 * createUser reports the email is already registered.
 */
async function findAuthUserIdByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  const normalized = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (match) return match.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main(): Promise<void> {
  const environment = parseServerEnv(process.env);
  const email = (process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = resolvePassword(environment.APP_URL);

  const admin = createClient(environment.NEXT_PUBLIC_SUPABASE_URL, environment.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create the Supabase auth user (email pre-confirmed) or reuse the existing one.
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });

  let authUserId: string | null = created.data.user?.id ?? null;
  if (created.error) {
    const alreadyExists = /already|registered|exists/i.test(created.error.message);
    if (!alreadyExists) throw created.error;
    authUserId = await findAuthUserIdByEmail(admin, email);
    if (!authUserId) throw new Error(`Auth user tồn tại nhưng không tìm thấy id cho ${email}.`);
    console.log(`ℹ️  Auth user đã tồn tại, tái sử dụng (${email}).`);
  }

  if (!authUserId) throw new Error("Không lấy được authUserId từ Supabase.");

  // Mirror into the local Prisma User table with ADMIN role (idempotent upsert).
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
  });

  try {
    const now = new Date();
    const user = await client.user.upsert({
      where: { authUserId },
      create: { authUserId, email, emailVerifiedAt: now, role: "ADMIN" },
      update: { role: "ADMIN", email, emailVerifiedAt: now },
      select: { email: true, role: true },
    });
    console.log(`✅ Admin sẵn sàng: ${user.email} (role: ${user.role})`);
  } finally {
    await client.$disconnect();
  }
}

if (process.argv[1]?.endsWith("seed-admin.ts")) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
