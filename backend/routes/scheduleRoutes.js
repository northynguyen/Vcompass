import express from "express";
import { addSchedule, getScheduleById, updateSchedule } from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/auth.js";

const scheduleRouter = express.Router();

scheduleRouter.post("/addNew", authMiddleware, addSchedule);
scheduleRouter.get("/:id", getScheduleById);
scheduleRouter.put('/update/:id', updateSchedule);
export default scheduleRouter;
