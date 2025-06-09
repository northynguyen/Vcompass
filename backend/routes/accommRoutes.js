import express from "express";
import {
  addNew,
  addNewRoom,
  deleteRoom,
  getAccommodationById,
  getListAccomm,
  getListAccommbyPartner,
  listRooms,
  updateAccommodation,
  updateRoomType, addReview,
  updateAccommodationStatusByAdmin, updateRatingResponse, getAccommWishList,
  searchAccommodations, getAllAccomm
} from "../controllers/accommController.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.js";
import { handleUploadErrors } from '../middleware/upload.js';

const accommRoutes = express.Router();

accommRoutes.get("/", getListAccomm);
accommRoutes.get("/all", getAllAccomm);
accommRoutes.get("/search", searchAccommodations);
accommRoutes.get("/:partnerId", getListAccommbyPartner);
accommRoutes.post("/:partnerId", upload.array("newImages", 8), addNew); // Add new accommodation
accommRoutes.put("/:partnerId/:id", upload.array("newImages", 8), updateAccommodation); // Update accommodation
accommRoutes.put("/:id",updateAccommodationStatusByAdmin);
accommRoutes.post("/:accommodationId/rooms",upload.array("newImages", 5),addNewRoom); // Add new room type
accommRoutes.put("/:accommodationId/rooms/:roomTypeId",upload.array("newImages", 8),updateRoomType); // Update room type
accommRoutes.delete("/:accommodationId/rooms/:roomTypeId", deleteRoom); // Delete room type
accommRoutes.get("/:accommodationId/rooms", listRooms); // Get list of rooms
accommRoutes.get("/getAccomm/:id", getAccommodationById);
accommRoutes.post("/addReview/:id", addReview);
accommRoutes.put('/updateRating/:accommodationId/ratings/:ratingId', updateRatingResponse);
accommRoutes.get("/user/wishlist", authMiddleware, getAccommWishList);

// Các route cần xác thực partner
accommRoutes.get('/partner/:partnerId', authMiddleware, getListAccommbyPartner);
accommRoutes.post('/partner/:partnerId', authMiddleware, handleUploadErrors, addNew);
accommRoutes.put('/partner/:partnerId/:id', authMiddleware, handleUploadErrors, updateAccommodation);
accommRoutes.post('/partner/:partnerId/:accommodationId/roomTypes', authMiddleware, handleUploadErrors, addNewRoom);
accommRoutes.put('/partner/:partnerId/:accommodationId/roomTypes/:roomTypeId', authMiddleware, handleUploadErrors, updateRoomType);
accommRoutes.put('/:accommodationId/ratings/:ratingId/response', authMiddleware, updateRatingResponse);

export default accommRoutes;
