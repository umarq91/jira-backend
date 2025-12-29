import express from "express";
import {
  createSprint,
  getProjectSprints,
  startSprint,
  completeSprint,
  deleteSprint,
} from "../controllers/sprint";
import { isAuthenticated } from "../middlewares";

const router = express.Router();

router.use(isAuthenticated);

router.post("/projects/:projectId/sprints", createSprint);
router.get("/projects/:projectId/sprints", getProjectSprints);

// sprint actions
router.patch("/sprints/:id/start", startSprint);
router.patch("/sprints/:id/complete", completeSprint);
router.delete("/sprints/:id", deleteSprint);

export default router;
