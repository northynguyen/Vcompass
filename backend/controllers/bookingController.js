// controllers/bookingController.js
import Booking from '../models/booking.js';
import Accommodation from '../models/accommodation.js';
import userModel from "../models/user.js";
import partnerModel from "../models/partner.js";
import { sendBookingEmails, sendCancelBookingEmails } from './emailController.js';
import { createNotification } from './notiController.js';

export const getBookingsByUser = async (req, res) => {
  const { userId } = req.body;
  const { status, startDate, endDate, page = 1, limit = 5 } = req.query;


  const filter = { userId };
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  try {
    // Count total documents for pagination metadata
    const total = await Booking.countDocuments(filter);

    // Retrieve paginated bookings with filter
    const bookings = await Booking.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error getting bookings' });
  }
};
export const getBookingsByPartner = async (req, res) => {
  const { userId } = req.body;
  const filter = { partnerId: userId };
  try {
    const bookings = await Booking.find(filter)
    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error getting bookings' });
  }
};

export const getAvailableRooms = async (req, res) => {
  const { accommodationId, startDate, endDate, adults, children } = req.query;

  try {
    // Convert dates to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch bookings for the accommodation and filter for overlapping dates
    const bookings = await Booking.find({ accommodationId });
    const unavailableRoomIds = bookings
      .filter(booking => {
        const bookingStart = new Date(booking.checkInDate);
        const bookingEnd = new Date(booking.checkOutDate);
        // Check for date overlap
        return (
          (start >= bookingStart && start <= bookingEnd) ||
          (end >= bookingStart && end <= bookingEnd) ||
          (start <= bookingStart && end >= bookingEnd)
        );
      })
      .map(booking => booking.roomId); // Map to unavailable room IDs

    // Fetch accommodation details to get room list
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ success: false, message: 'Accommodation not found' });
    }

    // Filter rooms based on availability and capacity requirements
    const availableRooms = accommodation.roomTypes.filter(room => {
      const isAvailable = !unavailableRoomIds.includes(room._id.toString()); // Check if room is not booked
      const meetsCapacity =
        room.numPeople.adult >= adults && room.numPeople.child >= Math.max(0, children - 1); // Check capacity for adults and children
      return isAvailable && meetsCapacity;
    });

    res.json({ success: true, availableRooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error finding available rooms' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      userId,
      partnerId,
      accommodationId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      specialRequest,
    } = req.body;

    // Tính toán thời gian lưu trú
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Lấy thông tin khách sạn và người dùng
    const accommodation = await Accommodation.findById(accommodationId);
    const user = await userModel.findById(userId);
    const partner = await partnerModel.findById(partnerId);

    if (!accommodation || !user || !partner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin liên quan.' });
    }

    const bookingDetails = {
      accommodationName: accommodation.name,
      roomName: accommodation.roomTypes.find(room => room._id.toString() === roomId)?.nameRoomType,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      numberOfGuests: numberOfGuests,
      duration: duration,
      totalAmount: totalAmount,
      specialRequest: specialRequest,
    };

    // Tạo booking mới
    const newBooking = new Booking({
      userId,
      partnerId,
      accommodationId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      duration,
      totalAmount,
      specialRequest,
      createdAt: new Date(),
    });

    await newBooking.save();
    const notificationData = {
      idSender: userId,
      idReceiver: partnerId,
      content: `Khách hàng ${user.name} đa dat phong`,
      type: 'partner',
      nameSender: user.name || "User",
      imgSender: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };



    await createNotification(global.io, notificationData);
    await sendBookingEmails(user, partner, accommodation, bookingDetails);

    res.status(201).json({ success: true, message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Lỗi tạo booking:', error);
    res.status(500).json({ success: false, message: 'Error creating booking' });
  }
};

export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { reason, additionalComments, otherReasons } = req.body;

  try {
    // Tìm booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Lấy thông tin khách sạn, user, partner
    const accommodation = await Accommodation.findById(booking.accommodationId);
    const user = await userModel.findById(booking.userId);
    const partner = await partnerModel.findById(booking.partnerId);

    if (!accommodation || !user || !partner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin liên quan.' });
    }

    // Cập nhật trạng thái booking và lý do hủy
    booking.status = 'cancelled';
    booking.cancellationReason = reason === 'Other' ? otherReasons : reason;
    booking.additionalComments = additionalComments;

    await booking.save();

    // Gửi email hủy đặt phòng
    const lyDoHuy = reason === 'Other' ? otherReasons : reason;
    const bookingDetails = {
      accommodationName: accommodation.name,
      roomName: accommodation.roomTypes.find(room => room._id.toString() === booking.roomId).nameRoomType,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      numberOfGuests: booking.numberOfGuests,
      totalAmount: booking.totalAmount,
    };

    // Tạo notification
    const notificationData = {
      idSender: user._id,
      idReceiver: partner._id,
      content: `Khách hàng ${user.name} đã hủy đặt phòng.`,
      type: 'partner',
      createdAt: new Date(),
      nameSender: user.name || "User",
      imgSender: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };
    await createNotification(global.io, notificationData);

    // Gửi email
    await sendCancelBookingEmails(user, partner, accommodation, bookingDetails, lyDoHuy);

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Lỗi khi hủy booking:', error);
    res.status(500).json({ success: false, message: 'Error cancelling booking' });
  }
};


export const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const partner = await partnerModel.findById(booking.partnerId);
    const notificationData = {
      idSender: booking.partnerId,
      idReceiver: booking.userId,
      content: `Trạng thái đặt phòng đã được thay đổi thành ${status === 'confirmed' ? 'Đa dat phong' : status === 'expired' ? 'đã ở' : 'hủy'}`,
      type: 'partner',
      createdAt: new Date(),
      nameSender: partner.name || "Partner",
      imgSender: partner.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };

    await createNotification(global.io, notificationData);
    booking.status = status;
    await booking.save();


    res.json({ success: true, message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating booking status' });
  }
};

export const getAllBookings = async (req, res) => {
  const { page = 1, limit = 5, startDate, endDate, status, accommodationId, partnerId } = req.query;

  // Convert `page` and `limit` to integers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Initialize filter object
  const filter = {};

  // Date range filter
  if (startDate && endDate) {
    filter.checkInDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Accommodation ID filter
  if (accommodationId) {
    filter.accommodationId = accommodationId;
  }

  if (partnerId) {
    filter.partnerId = partnerId;
  }

  try {
    // Count total documents matching filter
    const totalBookings = await Booking.countDocuments(filter);

    // Find bookings with pagination and filters
    const bookings = await Booking.find(filter)
      .populate({path: 'userId',  model: 'user', select: 'name avatar nationality email phone_number'})   
      .skip((pageNumber - 1) * limitNumber)
      .sort({ createdAt: -1 })
      .limit(limitNumber);

    res.json({
      success: true,
      totalBookings,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBookings / limitNumber),
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error getting bookings' });
  }
};

export const getBookingHistory = async (req, res) => {
  const { userId } = req.params; // Lấy userId từ request params
  const { page = 1, limit = 5, partnerId } = req.query; // Lấy page, limit, và partnerId từ query

  // Chuyển đổi page và limit về số nguyên
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
    // Xây dựng filter query
    const filter = { userId };
    if (partnerId) {
      filter.partnerId = partnerId;
    }

    // Tính tổng số bản ghi
    const totalRecords = await Booking.countDocuments(filter);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalRecords / limitNumber);

    // Lấy danh sách booking với phân trang và sắp xếp
    const bookingHistory = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    if (!bookingHistory || bookingHistory.length === 0) {
      return res.status(404).json({ success: false, message: "No booking history found for this user." });
    }


    // Trả về dữ liệu lịch sử đặt chỗ
    res.status(200).json({
      success: true,
      bookingHistory,
      totalPages,
      currentPage: pageNumber,
      totalRecords
    });

  } catch (error) {
    console.error("Error fetching booking history:", error);
    res.status(500).json({ success: false, message: "Server error, unable to fetch booking history." });
  }
};

