import express from "express";
import { handleChatRequest } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chatAi", handleChatRequest);

export default router;
