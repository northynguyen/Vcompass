import express from "express";
import {
  addNotification,
  getNotifications,
  removeNotification,
} from "../controllers/notiController.js";

const notificationRoutes = express.Router();

notificationRoutes.post("/notifications", addNotification);

notificationRoutes.delete("/notifications", removeNotification);

notificationRoutes.get("/notifications", getNotifications);

export { notificationRoutes };
