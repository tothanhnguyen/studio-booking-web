import { notFound, redirect } from "next/navigation";

import type { Actor } from "@/features/auth/application/current-actor";
import { ForbiddenError, requireRole, UnauthenticatedError } from "@/features/auth/application/require-role";

export async function getAdminPageActor(nextPath = "/admin"): Promise<Actor> {
  try {
    return await requireRole("ADMIN");
  } catch (error) {
    if (error instanceof UnauthenticatedError) redirect(`/login?next=${nextPath}`);
    if (error instanceof ForbiddenError) notFound();
    throw error;
  }
}
