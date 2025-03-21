import express from "express";
import {
  addSchedule,
  getScheduleById,
  getSchedulesByIdUser,
  updateSchedule,
  getAllSchedule,
  getTopAddressSchedule,
  updateLikeComment,
  deleteActivity, uploadFiles ,deleteSchedule,

} from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/auth.js";

const scheduleRouter = express.Router();

scheduleRouter.post("/addNew", authMiddleware, addSchedule);
scheduleRouter.get("/getAllSchedule", getAllSchedule);
scheduleRouter.get("/:id", getScheduleById);
scheduleRouter.put("/update/:id", updateSchedule);
scheduleRouter.get("/user/getSchedules", authMiddleware, getSchedulesByIdUser);
// scheduleRouter.get("/otherUser/getSchedules/:id", getSchedulesByIdOtherUser);
scheduleRouter.get("/getByCity/Top", getTopAddressSchedule);

scheduleRouter.post("/user/updateLikeComment", authMiddleware, updateLikeComment);
scheduleRouter.delete("/:id/activities/:activityId", deleteActivity);
scheduleRouter.post('/upload', uploadFiles);
scheduleRouter.delete('/:id', deleteSchedule);
export default scheduleRouter;
