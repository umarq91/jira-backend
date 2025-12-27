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
    await pool.query("SELECT 1");
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ DB error:", err as unknown);
  }
}

export default pool;
