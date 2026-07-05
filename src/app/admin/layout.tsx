import type { ReactNode } from "react";

import { getAdminPageActor } from "@/features/auth/application/admin-page-actor";
import { AdminShell } from "@/features/dashboard/presentation/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await getAdminPageActor();

  return <AdminShell>{children}</AdminShell>;
}
