import "dotenv/config";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
if (process.env.NEON_LOCAL_SQL_ENDPOINT) {
  neonConfig.fetchEndpoint = process.env.NEON_LOCAL_SQL_ENDPOINT;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
