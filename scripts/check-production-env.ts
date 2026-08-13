import "dotenv/config";

import { validateProductionReadiness } from "../src/lib/env/production-readiness";

const environment = validateProductionReadiness(process.env);
const validatedKeys = Object.keys(environment).sort();

console.log(`Production environment valid (${validatedKeys.join(", ")})`);
