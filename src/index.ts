import express from "express";
import config from "./config";
import pool, { testDb } from "./db";
import userRoutes from "./routes/auth"
import projectsRoutes from "./routes/projects"
import issuesRoutes from "./routes/issues"

const app = express();

app.use(express.json());

async function startServer() {
  try {
    await testDb();

    app.listen(config.port, () => {
      console.log(`🚀 Server running on ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database");
    console.error(error);
    process.exit(1); // ⛔ crash app if DB is down
  }
}


app.use('/users',userRoutes);
app.use('/projects',projectsRoutes)
app.use('/issue',issuesRoutes)
startServer();