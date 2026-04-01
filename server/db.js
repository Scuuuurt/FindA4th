import { Pool } from "pg";

let pool = null;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!hasDatabase()) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  return pool;
}

export async function query(text, params = []) {
  const activePool = getPool();
  if (!activePool) {
    throw new Error("DATABASE_URL is not configured");
  }

  return activePool.query(text, params);
}
