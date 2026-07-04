export type AppRole = "CUSTOMER" | "ADMIN";

export type Actor = Readonly<{
  id: string;
  role: AppRole;
}>;

export async function getCurrentActor(): Promise<Actor | null> {
  if (process.env.ALLOW_TEST_ACTOR !== "true") return null;

  const { cookies } = await import("next/headers");
  const role = (await cookies()).get("mowstudio-test-role")?.value;
  if (role !== "ADMIN" && role !== "CUSTOMER") return null;

  return { id: `test-${role.toLowerCase()}`, role };
}
