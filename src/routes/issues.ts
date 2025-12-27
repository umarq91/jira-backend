import { createIssue, getIssues } from "../controllers/issues";
import { isAuthenticated } from "../middlewares";

const express = require("express");

const router = express.Router();

/*
GET ->/issues/:projectId get All Issues of a project
GET ->/issues/:id GET SINGLE ISSUE
POST -> CREATE ISSUE 
PATCH -> EDIT ISSUE
POST -> /issues/:issueId/assign -> {from:"",to:""} 
*/

router.post("/", isAuthenticated, createIssue);
router.get('/:projectId',getIssues)

export default router;
