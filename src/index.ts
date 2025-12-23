import express from "express";
import config from "./config";
import pool, { testDb } from "./db";
const app = express();

async function startServer() {
  try {
    // ✅ Test DB BEFORE starting server
    await testDb();
    console.log("✅ Database connected");

    app.listen(config.port, () => {
      console.log(`🚀 Server running on ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database");
    console.error(error);
    process.exit(1); // ⛔ crash app if DB is down
  }
}

startServer();