import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/db";

const isLocalDb =
  databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

let db: any;

if (isLocalDb) {
  // Use node-postgres for local development
  const { Pool } = require("pg");
  const { drizzle } = require("drizzle-orm/node-postgres");
  const pool = new Pool({ connectionString: databaseUrl });
  db = drizzle(pool, { schema });
} else {
  // Use Neon serverless for cloud
  const { neon } = require("@neondatabase/serverless");
  const { drizzle } = require("drizzle-orm/neon-http");
  const sql = neon(databaseUrl);
  db = drizzle(sql, { schema });
}

export default db;
