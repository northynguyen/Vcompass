// routes/bookingRoutes.js
import express from 'express';
import {  createBooking , getBookingsByUser,getAvailableRooms} from '../controllers/bookingController.js';
import authMiddleware from '../middleware/auth.js';
const bookingRouter = express.Router();


// Route để tạo booking mới
bookingRouter.post('/create', createBooking);
bookingRouter.get('/user/getAll',authMiddleware, getBookingsByUser);
bookingRouter.get('/getAvailableRoom', getAvailableRooms);
export default bookingRouter;
