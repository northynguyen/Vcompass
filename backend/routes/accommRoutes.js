
import express from 'express';
import { deleteRoom, listRooms, addNew, addNewRoom, getList, updateAccommodation, updateRoomType } from "../controllers/accommController.js";
import {upload} from "../middleware/upload.js";
const accommRoutes = express.Router();


accommRoutes.get("/:partnerId", getList);                         
accommRoutes.post("/:partnerId", upload.array('images', 5), addNew);  // Add new accommodation
accommRoutes.put("/:partnerId/:id", upload.array('newImages', 5), updateAccommodation);  // Update accommodation
accommRoutes.post("/:accommodationId/rooms", upload.array('images', 5), addNewRoom);  // Add new room type
accommRoutes.put("/:accommodationId/rooms/:roomTypeId", upload.array('newImages', 8), updateRoomType); // Update room type
accommRoutes.delete("/:accommodationId/rooms/:roomTypeId", deleteRoom); // Delete room type
accommRoutes.get("/:accommodationId/rooms", listRooms); // Get list of rooms

export default accommRoutes;
