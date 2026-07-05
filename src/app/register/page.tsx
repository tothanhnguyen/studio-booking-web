import Link from "next/link";

import { AuthForm } from "@/features/auth/presentation/auth-form";

export default function RegisterPage() {
  return <section className="mx-auto max-w-md"><h1 className="text-4xl font-semibold">Tạo tài khoản</h1><p className="mt-3 text-stone-300">Đăng ký để quản lý các booking đã xác minh.</p><AuthForm mode="register" /><p className="mt-5 text-sm">Đã có tài khoản? <Link className="text-amber-300" href="/login">Đăng nhập</Link></p></section>;
}
