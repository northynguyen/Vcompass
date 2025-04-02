import express from "express";
import { handleChatRequest, generateSchedule } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chatAi", handleChatRequest);
router.post("/generateSchedule", generateSchedule);

export default router;
