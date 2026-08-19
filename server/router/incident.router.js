import express from "express";
import { incidents,GetIncidents,updateIncidentStatus} from "../controllers/incident.controllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, incidents);
router.get("/",requireAuth,GetIncidents);
router.patch("/:id/status",requireAuth,updateIncidentStatus);

export default router;