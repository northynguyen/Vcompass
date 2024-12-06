import express from "express";
import {
  addNotification,
  getNotifications,
  updateNotificationStatus
} from "../controllers/notiController.js";

const notificationRoutes = express.Router();

notificationRoutes.post("/notifications", addNotification);

notificationRoutes.get("/:idReceiver", getNotifications);

notificationRoutes.put("/:id" ,updateNotificationStatus )

export { notificationRoutes };
