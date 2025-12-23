import express from "express";
import config from "./config";
import pool, { testDb } from "./db";
import userAuth from "./routes/auth"
const app = express();

app.use(express.json());

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


app.use('/users',userAuth)
startServer();