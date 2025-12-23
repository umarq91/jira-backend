import { Pool } from "pg";
import config from "../config";

const pool = new Pool({
  database: config.db_database,
  user: config.db_user,
  host: config.db_host,
  port: config.db_port,
});

export async function testDb() {
  try {
    const res = await pool.query("SELECT NOW()");
  } catch (err) {
    console.error("❌ DB error:", err as unknown);
  }
}

export default pool;
