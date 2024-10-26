import express from "express";
import { addSchedule } from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/auth.js";

const scheduleRouter = express.Router();

scheduleRouter.post("/addNew", authMiddleware, addSchedule);

export default scheduleRouter;
