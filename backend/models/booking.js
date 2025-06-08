import mongoose from "mongoose";

const { Schema } = mongoose;

const BookingSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  partnerId: {
    type: String,
    required: true,
  },
  accommodationId: {
    type: String,
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
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    default: 'pending',
  },
  cancellationReason : {
    type: String,
  },
  
  additionalComments: {
    type: String,
  },
  
  specialRequest: {
    type: String,
  },
  totalAmount: {
    type: Number,
    required: true,
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
