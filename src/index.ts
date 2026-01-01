import express, { Request, Response } from "express";
import config from "./config";
import { testDb } from "./db";
import userRoutes from "./routes/auth";
import projectsRoutes from "./routes/projects";
import issuesRoutes from "./routes/issues";
import sprintRoutes from "./routes/sprints";
import { connectRedis } from "./cache/redis";
import { rateLimiter } from "./middlewares/rate-limit";

const app = express();

app.use(express.json());
app.use(
  rateLimiter({
    capacity: 5,
    refillRate:1,
  })
);
async function startServer() {
  try {
    await testDb();
    await connectRedis();
    app.listen(config.port, () => {
      console.log(`🚀 Server running on ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database");
    console.error(error);
    process.exit(1); // ⛔ crash app if DB is down
  }
}
app.get('/health',(req:Request,res:Response)=>{
    res.json({
      sucess:true
      message:" Server is runnign!"
    })
})
app.use("/users", userRoutes);
app.use("/projects", projectsRoutes);
app.use("/issue", issuesRoutes);
app.use("/sprints", sprintRoutes);
startServer();
