// Loads local env for dev scripts, using the same precedence as Next.js: .env.local wins over .env.
// process.loadEnvFile never overrides variables already set in the shell, so loading both is safe.
import { existsSync } from "node:fs";

for (const name of [".env.local", ".env"]) {
  const file = new URL(`../${name}`, import.meta.url);
  if (existsSync(file)) process.loadEnvFile(file);
}
