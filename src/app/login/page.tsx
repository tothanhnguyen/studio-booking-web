import Link from "next/link";

import { signInWithGoogleAction } from "@/features/auth/application/auth-actions";
import { AuthForm } from "@/features/auth/presentation/auth-form";

export default function LoginPage() {
  return <section className="mx-auto max-w-md"><h1 className="text-4xl font-semibold">Đăng nhập</h1><p className="mt-3 text-[var(--color-text-muted)]">Theo dõi booking và lịch sử studio của bạn.</p><AuthForm mode="login" /><form action={signInWithGoogleAction} className="mt-3"><button className="w-full rounded-full border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-5 py-3">Tiếp tục với Google</button></form><p className="mt-5 text-sm">Chưa có tài khoản? <Link className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-action)]" href="/register">Đăng ký</Link></p></section>;
}
