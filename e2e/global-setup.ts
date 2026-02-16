import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://szj@localhost:5432/yiya_e2e";

/**
 * Global setup: reset test user to a clean state before all tests.
 */
export default async function globalSetup() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query(
      "DELETE FROM challenge_progress WHERE user_id = 'e2e-test-user'",
    );
    await pool.query(
      "UPDATE user_progress SET hearts = 5, points = 100 WHERE user_id = 'e2e-test-user'",
    );
  } finally {
    await pool.end();
  }
}
