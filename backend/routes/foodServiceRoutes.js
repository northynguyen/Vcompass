import express from "express";
import { getListFoodService, getListByPartner, createFoodService, updateFoodService, deleteFoodService } from "../controllers/foodServiceController.js";
import {upload} from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.js";


const foodServiceRoutes = express.Router();

foodServiceRoutes.get("/", getListFoodService);
foodServiceRoutes.get("/partner", authMiddleware, getListByPartner);

foodServiceRoutes.post("/add", authMiddleware, upload.fields([
    { name: 'images', maxCount: 5 }, 
    { name: 'menuImages', maxCount: 5 }
]), createFoodService);

foodServiceRoutes.post("/update", authMiddleware, upload.fields([
    { name: 'images', maxCount: 5 }, 
    { name: 'menuImages', maxCount: 5 }
]), updateFoodService);

foodServiceRoutes.post("/delete", authMiddleware, deleteFoodService);

export default foodServiceRoutes;
