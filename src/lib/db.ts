import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

import { env } from "@/lib/env";

// One pool per server instance; cached on globalThis so dev hot-reload doesn't leak connections.
const globalForPool = globalThis as unknown as { pgPool?: Pool };

function pool(): Pool {
  globalForPool.pgPool ??= new Pool({ connectionString: env().DATABASE_URL, max: 5 });
  return globalForPool.pgPool;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool().query<T>(text, params);
  return result.rows;
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
