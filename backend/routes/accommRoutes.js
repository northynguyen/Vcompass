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
  searchAccommodations
} from "../controllers/accommController.js";
import { upload } from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.js";
const accommRoutes = express.Router();

accommRoutes.get("/", getListAccomm);
accommRoutes.get("/search", searchAccommodations);
accommRoutes.get("/:partnerId", getListAccommbyPartner);
accommRoutes.post("/:partnerId", upload.array("newImages", 5), addNew); // Add new accommodation
accommRoutes.put("/:partnerId/:id", upload.array("newImages", 5), updateAccommodation); // Update accommodation
accommRoutes.put("/:id", updateAccommodationStatusByAdmin);
accommRoutes.post("/:accommodationId/rooms", upload.array("newImages", 5), addNewRoom); // Add new room type
accommRoutes.put("/:accommodationId/rooms/:roomTypeId", upload.array("newImages", 8), updateRoomType); // Update room type
accommRoutes.delete("/:accommodationId/rooms/:roomTypeId", deleteRoom); // Delete room type
accommRoutes.get("/:accommodationId/rooms", listRooms); // Get list of rooms
accommRoutes.get("/getAccomm/:id", getAccommodationById);
accommRoutes.post("/addReview/:id", addReview);
accommRoutes.put('/updateRating/:accommodationId/ratings/:ratingId', updateRatingResponse);
accommRoutes.get("/user/wishlist", authMiddleware, getAccommWishList);
export default accommRoutes;
