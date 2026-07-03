import { serverEnv } from "../src/lib/env/server";

const validatedKeys = Object.keys(serverEnv).sort();

console.log(`Environment valid (${validatedKeys.join(", ")})`);
