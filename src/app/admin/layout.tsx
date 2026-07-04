import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  ForbiddenError,
  requireRole,
  UnauthenticatedError,
} from "@/features/auth/application/require-role";
import { AdminShell } from "@/features/dashboard/presentation/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  try {
    await requireRole("ADMIN");
  } catch (error) {
    if (error instanceof UnauthenticatedError) redirect("/login?next=/admin");
    if (error instanceof ForbiddenError) notFound();
    throw error;
  }

  return <AdminShell>{children}</AdminShell>;
}
