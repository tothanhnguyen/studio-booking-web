"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { actionClassName } from "@/components/ui/action";
import { FormField } from "@/components/ui/form-field";
import {
  signInAction,
  signInWithGoogleAction,
  signUpAction,
} from "@/features/auth/application/auth-actions";

export function AuthForm({ mode }: Readonly<{ mode: "login" | "register" }>) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const result = await (mode === "login" ? signInAction : signUpAction)({
      email: data.get("email"),
      password: data.get("password"),
    });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message ?? "Không thể xử lý yêu cầu.");
      return;
    }
    if (mode === "login") router.push("/account/bookings");
    else setMessage(result.message ?? "Hãy kiểm tra email để xác minh tài khoản.");
  }

  const isStatusMessage = message.includes("kiểm tra email");

  return (
    <div className="auth-split-actions">
      <form className="auth-split-form-fields" onSubmit={submit}>
        <FormField htmlFor="auth-email" label="Email">
          <input autoComplete="email" id="auth-email" name="email" required type="email" />
        </FormField>
        <FormField htmlFor="auth-password" label="Mật khẩu">
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            id="auth-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </FormField>
        {message ? (
          <p
            className={isStatusMessage ? "auth-split-message" : "ui-field__error"}
            role={isStatusMessage ? "status" : "alert"}
          >
            {message}
          </p>
        ) : null}
        <button className={actionClassName("primary")} disabled={loading} type="submit">
          {loading ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>
      <p className="auth-split-divider">
        <span>hoặc</span>
      </p>
      <form action={signInWithGoogleAction}>
        <button className={actionClassName("secondary")} type="submit">
          Tiếp tục với Google
        </button>
      </form>
    </div>
  );
}
