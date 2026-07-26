import Link from "next/link";

import { AuthForm } from "@/features/auth/presentation/auth-form";
import { AuthShell } from "@/features/auth/presentation/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      description="Theo dõi booking và lịch sử studio của bạn."
      eyebrow="Tài khoản"
      footer={
        <p className="auth-split-switch">
          Chưa có tài khoản?{" "}
          <Link className="auth-split-switch-link" href="/register">
            Đăng ký
          </Link>
        </p>
      }
      title="Đăng nhập"
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
