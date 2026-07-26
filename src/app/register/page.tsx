import Link from "next/link";

import { AuthForm } from "@/features/auth/presentation/auth-form";
import { AuthShell } from "@/features/auth/presentation/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      description="Đăng ký để quản lý các booking đã xác minh."
      eyebrow="Tài khoản"
      footer={
        <p className="auth-split-switch">
          Đã có tài khoản?{" "}
          <Link className="auth-split-switch-link" href="/login">
            Đăng nhập
          </Link>
        </p>
      }
      title="Tạo tài khoản"
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
