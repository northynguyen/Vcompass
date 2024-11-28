import express from "express";
import {
  createFoodService,
  deleteFoodService,
  getFoodServiceById,
  getListByPartner,
  getListFoodService,
  updateFoodService, addReview,
  getAdminGetListByPartner,
  updateStatusFoodServiceAdmin
} from "../controllers/foodServiceController.js";
import authMiddleware from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const foodServiceRoutes = express.Router();

foodServiceRoutes.get("/", getListFoodService);
foodServiceRoutes.get("/partner/:partnerId",getListByPartner);
foodServiceRoutes.get("/:partnerId", getAdminGetListByPartner);
foodServiceRoutes.post(
  "/add",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "menuImages", maxCount: 5 },
  ]),
  createFoodService
);

foodServiceRoutes.post(
  "/update",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "menuImages", maxCount: 5 },
  ]),
  updateFoodService
);
foodServiceRoutes.put("/:foodServiceId", updateStatusFoodServiceAdmin);
foodServiceRoutes.post("/delete", authMiddleware, deleteFoodService);
foodServiceRoutes.get("/:id", getFoodServiceById);
foodServiceRoutes.post("/addReview/:id", addReview);

export default foodServiceRoutes;
