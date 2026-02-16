import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://szj@localhost:5432/yiya_e2e";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL });
  }
  return pool;
}

/** Reset the e2e test user's progress to a clean state */
export async function resetTestUser() {
  const p = getPool();
  await p.query(
    "DELETE FROM challenge_progress WHERE user_id = 'e2e-test-user'",
  );
  await p.query(
    "UPDATE user_progress SET hearts = 5, points = 100 WHERE user_id = 'e2e-test-user'",
  );
}

/** Close the pool connection */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
