import express from "express";
import {
  addSchedule,
  getScheduleById,
  getSchedulesByIdUser,
  updateSchedule,
} from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/auth.js";

const scheduleRouter = express.Router();

scheduleRouter.post("/addNew", authMiddleware, addSchedule);
scheduleRouter.get("/:id", getScheduleById);
scheduleRouter.put("/update/:id", updateSchedule);
scheduleRouter.get("/user/getSchedules", authMiddleware, getSchedulesByIdUser);
export default scheduleRouter;
