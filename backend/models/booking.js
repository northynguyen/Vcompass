import mongoose from "mongoose";

const { Schema } = mongoose;

const BookingSchema = new Schema({
  userId: {
    type: String, // Không cần ObjectId nếu không liên kết
    required: true,
  },
  partnerId: {
    type: String, // Không cần ObjectId nếu không liên kết
    required: true,
  },
  accommodationId: {
    type: String, // Không cần ObjectId nếu không liên kết
    required: true,
  },
  roomId: {
    type: String, // Không cần ObjectId nếu không liên kết
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  numberOfGuests: {
    adult: {
      type: Number,
      required: true,
    },
    child: {
      type: Number,
      required: true,
    },
  },
  duration: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'canceled', 'expired'],
    default: 'pending',
  },
  specialRequest: {
    type: String,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  guestInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    nationality: { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
},{ timestamps: true }
);

// Export Booking model
const Booking = mongoose.models.Booking || mongoose.model("booking", BookingSchema);
export default Booking;
