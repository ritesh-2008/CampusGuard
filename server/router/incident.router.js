import express from "express";
import { incidents } from "../controllers/incident.controllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, incidents);

export default router;