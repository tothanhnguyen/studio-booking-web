import "dotenv/config";

import { validateProductionReadiness } from "../src/lib/env/production-readiness";
import { parseServerEnv } from "../src/lib/env/server-schema";

const isProduction = process.env.VERCEL_ENV === "production";
const environment = isProduction
  ? validateProductionReadiness(process.env)
  : parseServerEnv(process.env);

console.log(
  `${isProduction ? "Production" : "Preview"} deployment environment valid (${Object.keys(environment).sort().join(", ")})`,
);
