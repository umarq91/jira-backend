import { addMemberInProject, createProject, deleteProject, getAllMembers, getMyProjects, getProject, getProjects } from "../controllers/projects";
import { isAdmin, isAuthenticated } from "../middlewares";

const express = require("express");

const router = express.Router();

/*
Pending endpoints: 
GET /projects -> User Projects -> DONE
GET /projects/:projectId -> DONE
POST /projects/:projectId/members -> only ADMIN can add such projects -> DONE
GET /projects/:projectId/members -> Get List of Members of a project -> Done
DELETE /projects/:projectId/members/:userId -> only ADMIN can Remove Member 
*/


router.post('/',isAuthenticated,createProject);
router.get('/myprojects',isAuthenticated,getMyProjects)
router.delete('/:projectId',isAuthenticated,deleteProject);
router.get('/',isAuthenticated,getProjects);
router.get('/:projectId',isAuthenticated,getProject)
router.get('/projects/:projectId/members',isAuthenticated,isAdmin,addMemberInProject);
router.get('/:projectId/members',isAuthenticated,getAllMembers);

// user gets all projects

export default router;