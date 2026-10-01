// Applies migrations/*.sql in order, once each (tracked in schema_migrations). Usage: pnpm db:migrate
import "./env.mjs";
import { readdirSync, readFileSync } from "node:fs";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
const dir = new URL("../migrations/", import.meta.url);
for (const name of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  if (done.has(name)) continue;
  await client.query("BEGIN");
  try {
    await client.query(readFileSync(new URL(name, dir), "utf8"));
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
    await client.query("COMMIT");
    console.log(`applied ${name}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
console.log("migrations up to date");
await client.end();
