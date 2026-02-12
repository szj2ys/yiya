import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/db";

const sql = neon(databaseUrl);
// @ts-ignore
const db = drizzle(sql, { schema });

export default db;
