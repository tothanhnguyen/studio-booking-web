import { PrismaPg } from "@prisma/adapter-pg";

const DEFAULT_SCHEMA = "public";

export function createPrismaPgAdapter(connectionString: string): PrismaPg {
  const url = new URL(connectionString);
  const schema = url.searchParams.get("schema")?.trim() || DEFAULT_SCHEMA;

  return new PrismaPg({ connectionString }, { schema });
}
