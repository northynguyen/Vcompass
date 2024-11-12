// routes/bookingRoutes.js
import express from 'express';
import {  createBooking , getBookingsByUser,getAvailableRooms,cancelBooking, getAllBookings, updateBookingStatus,getBookingHistory} from '../controllers/bookingController.js';
import authMiddleware from '../middleware/auth.js';
const bookingRouter = express.Router();


// Route để tạo booking mới
bookingRouter.post('/create', createBooking);
bookingRouter.get('/user/getAll',authMiddleware, getBookingsByUser);
bookingRouter.get('/user/:userId/booking-history', getBookingHistory);
bookingRouter.get('/getAvailableRoom', getAvailableRooms);
bookingRouter.put('/:bookingId/cancel', cancelBooking);
bookingRouter.get('/getAll', getAllBookings);
bookingRouter.put('/updateStatus', updateBookingStatus);
export default bookingRouter;
