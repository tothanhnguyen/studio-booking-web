import { describe, expect, it, vi } from "vitest";

const prismaPg = vi.fn();

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: function MockPrismaPg(config: unknown, options: unknown) {
    prismaPg(config, options);
  },
}));

import { createPrismaPgAdapter } from "./prisma-adapter";

describe("Prisma PostgreSQL adapter", () => {
  it("uses the public schema by default", () => {
    createPrismaPgAdapter("postgresql://postgres:password@localhost:5432/postgres");

    expect(prismaPg).toHaveBeenLastCalledWith(
      { connectionString: "postgresql://postgres:password@localhost:5432/postgres" },
      { schema: "public" },
    );
  });

  it("uses the schema declared in the connection URL", () => {
    const connectionString =
      "postgresql://postgres:password@localhost:5432/postgres?schema=mowstudio_preview";

    createPrismaPgAdapter(connectionString);

    expect(prismaPg).toHaveBeenLastCalledWith(
      { connectionString },
      { schema: "mowstudio_preview" },
    );
  });
});
