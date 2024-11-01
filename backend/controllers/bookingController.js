// controllers/bookingController.js
import Booking from '../models/booking.js';
import Accommodation from '../models/accommodation.js';
export const getBookingsByUser = async (req, res) => {
  const { userId } = req.body;
  const { status, startDate, endDate, page = 1, limit = 5 } = req.query;

  // Initialize filter object
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
        room.numPeople.adult >= adults && room.numPeople.child >= Math.max(0, children -1); // Check capacity for adults and children
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
    const { userId, partnerId, accommodationId, roomId, checkInDate, checkOutDate, numberOfGuests, totalAmount, specialRequest, guestInfo } = req.body;

    // Tính toán duration (thời gian lưu trú)
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Tính số ngày

    // Tạo một booking mới
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
      guestInfo,
      createdAt: new Date(),
    });

    // Lưu booking vào database
    await newBooking.save();

    res.status(201).json( { success: true, message: 'Booking created successfully', booking: newBooking});
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: 'Error creating booking' });
  }
};
