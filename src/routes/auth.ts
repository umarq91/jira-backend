import { getMe, login, signUp } from "../controllers/auth";
import { isAuthenticated } from "../middlewares";

const express = require("express");

const router = express.Router();

router.post("/signup", signUp);
router.post('/login',login)
router.get('/me',isAuthenticated,getMe)

export default router;