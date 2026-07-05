"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { serverEnv } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({ email: z.email("Email không hợp lệ."), password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.") });

export async function signInAction(input: unknown) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Thông tin không hợp lệ." } as const;
  const { error } = await (await createClient()).auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "Email hoặc mật khẩu không đúng." } as const;
  return { ok: true } as const;
}

export async function signUpAction(input: unknown) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Thông tin không hợp lệ." } as const;
  const { error } = await (await createClient()).auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${serverEnv.APP_URL}/auth/callback?next=/account/bookings` },
  });
  if (error) return { ok: false, message: "Không thể đăng ký. Email có thể đã được sử dụng." } as const;
  return { ok: true, message: "Hãy kiểm tra email để xác minh tài khoản." } as const;
}

export async function signInWithGoogleAction() {
  const { data, error } = await (await createClient()).auth.signInWithOAuth({
    provider: "google", options: { redirectTo: `${serverEnv.APP_URL}/auth/callback?next=/account/bookings` },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOutAction() {
  await (await createClient()).auth.signOut();
  redirect("/");
}
