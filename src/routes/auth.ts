import { Request, Response } from "express";
import { getMe, login, signUp } from "../controllers/auth";
import { isAdmin } from "../middlewares";

const express = require("express");

const router = express.Router();

router.post("/signup", signUp);
router.post('/login',login)
router.get('/me',isAdmin,getMe)

export default router;