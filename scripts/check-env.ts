import "dotenv/config";

import { parseServerEnv } from "../src/lib/env/server-schema";

const serverEnv = parseServerEnv(process.env);

const validatedKeys = Object.keys(serverEnv).sort();

console.log(`Environment valid (${validatedKeys.join(", ")})`);
