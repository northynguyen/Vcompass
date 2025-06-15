// routes/bookingRoutes.js
import express from "express";
import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getAvailableRooms,
  getBookingHistory,
  getBookingsByUser,
  updateBookingStatus,
  getBookingsByPartner,
  getBookingsForSchedule,
  getBookingById,
} from "../controllers/bookingController.js";
import authMiddleware from "../middleware/auth.js";
const bookingRouter = express.Router();

// Route để tạo booking mới
bookingRouter.post("/create", createBooking);
bookingRouter.get("/user/getAll", authMiddleware, getBookingsByUser);
bookingRouter.get("/user/getBookingForSchedule", authMiddleware, getBookingsForSchedule);
bookingRouter.get("/user/:userId/booking-history", getBookingHistory);
bookingRouter.get("/getAvailableRoom", getAvailableRooms);
bookingRouter.put("/:bookingId/cancel", cancelBooking);
bookingRouter.get("/getAll", getAllBookings);
bookingRouter.put("/updateStatus", updateBookingStatus);
bookingRouter.get("/partner/getAll", authMiddleware, getBookingsByPartner);
bookingRouter.get("/:bookingId", getBookingById);

export default bookingRouter;
