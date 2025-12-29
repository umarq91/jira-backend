import express from "express";
import {
  createIssue,
  getBacklogIssues,
  getSprintIssues,
  moveIssue,
  updateIssueStatus,
} from "../controllers/issues";
import { isAuthenticated } from "../middlewares";

const router = express.Router();

router.use(isAuthenticated);

router.post("/", createIssue);

router.get("/backlog/:projectId", getBacklogIssues);

router.get("/sprint/:sprintId", getSprintIssues);

router.patch("/:issueId/move", moveIssue);
router.patch("/:issueId/status", updateIssueStatus);

export default router;
