export type AppRole = "CUSTOMER" | "ADMIN";

export type Actor = Readonly<{
  id: string;
  role: AppRole;
  email?: string;
  emailVerified?: boolean;
}>;

export async function getCurrentActor(): Promise<Actor | null> {
  if (process.env.ALLOW_TEST_ACTOR === "true") {
    const { cookies } = await import("next/headers");
    const role = (await cookies()).get("mowstudio-test-role")?.value;
    if (role !== "ADMIN" && role !== "CUSTOMER") return null;
    const [{ prisma }] = await Promise.all([import("@/lib/db/prisma")]);
    const suffix = role === "ADMIN" ? "1" : "2";
    const authUserId = `00000000-0000-4000-8000-00000000000${suffix}`;
    const email = `${role.toLowerCase()}-test@mowstudio.local`;
    await prisma.user.createMany({
      data: [{ authUserId, email, role, emailVerifiedAt: new Date(0) }],
      skipDuplicates: true,
    });
    const user = await prisma.user.update({
      where: { authUserId },
      data: { email, role, emailVerifiedAt: new Date(0) },
      select: { id: true, role: true, email: true },
    });
    return { ...user, emailVerified: true };
  }

  const [{ createClient }, { syncAuthenticatedUser }] = await Promise.all([
    import("@/lib/supabase/server"), import("@/features/auth/application/sync-user"),
  ]);
  const { data: { user }, error } = await (await createClient()).auth.getUser();
  if (error || !user?.email || !user.email_confirmed_at) return null;
  const local = await syncAuthenticatedUser({
    authUserId: user.id, email: user.email, emailVerifiedAt: user.email_confirmed_at,
    metadata: user.user_metadata,
  });
  return { id: local.id, role: local.role, email: local.email, emailVerified: true };
}
