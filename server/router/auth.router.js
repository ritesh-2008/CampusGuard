import express from "express";
import { getme } from "../controllers/auth.controllers.js";
import { requireAuth } from "../middleware/auth.js";
const router = express.Router();

router.get("/me",requireAuth,getme);

export default router;