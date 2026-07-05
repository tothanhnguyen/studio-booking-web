"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { signInAction, signUpAction } from "@/features/auth/application/auth-actions";

export function AuthForm({ mode }: Readonly<{ mode: "login" | "register" }>) {
  const router = useRouter(); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const result = await (mode === "login" ? signInAction : signUpAction)({ email: data.get("email"), password: data.get("password") });
    setLoading(false);
    if (!result.ok) { setMessage(result.message ?? "Không thể xử lý yêu cầu."); return; }
    if (mode === "login") router.push("/account/bookings"); else setMessage(result.message ?? "Hãy kiểm tra email để xác minh tài khoản.");
  }
  return <form className="mt-6 grid gap-4" onSubmit={submit}>
    <label className="grid gap-1">Email<input name="email" type="email" autoComplete="email" required className="rounded-lg bg-stone-900 p-3" /></label>
    <label className="grid gap-1">Mật khẩu<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} className="rounded-lg bg-stone-900 p-3" /></label>
    {message && <p role={message.includes("kiểm tra email") ? "status" : "alert"} className="text-sm text-amber-300">{message}</p>}
    <button disabled={loading} className="rounded-full bg-amber-300 px-5 py-3 font-semibold text-stone-950 disabled:opacity-50">{loading ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Đăng ký"}</button>
  </form>;
}
