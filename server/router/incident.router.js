import express from "express";
import { incidents, GetIncidents } from "../controllers/incident.controllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, incidents);
router.get("/", requireAuth, GetIncidents);

export default router;