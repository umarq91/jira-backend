import express from "express";
import {
  createProject,
  deleteProject,
  getAllMembers,
  getMyProjects,
  getProject,
  getProjects,
  addMemberInProject,
  removeMemberFromProject,
} from "../controllers/projects";
import { isAdmin, isAuthenticated } from "../middlewares";

const router = express.Router();

/*
Routes summary
POST   /projects                     -> Create project
GET    /projects                     -> Get projects created by user
GET    /projects/my                  -> Get projects user is a member of
GET    /projects/:projectId           -> Get single project
DELETE /projects/:projectId           -> Delete project (owner only)

POST   /projects/:projectId/members   -> Add member (admin only)
GET    /projects/:projectId/members   -> Get members of project
*/

router.post("/", isAuthenticated, createProject);
router.get("/", isAuthenticated, getProjects);
router.get("/my", isAuthenticated, getMyProjects);
router.get("/:projectId", isAuthenticated, getProject);
router.delete("/:projectId", isAuthenticated, deleteProject);

router.get("/:projectId/members", isAuthenticated, getAllMembers);

router.post("/:projectId/members", isAuthenticated, addMemberInProject);
router.delete(
  "/:projectId/members/:userId",
  isAuthenticated,
  removeMemberFromProject
);
router.get("/:projectId/members", isAuthenticated, getAllMembers);

export default router;
