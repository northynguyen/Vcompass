import { Schema } from "mongoose";

const BookingSchema = new Schema({
  idUser: { type: String, required: true },
  idDestination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const Booking =
  mongoose.models.Booking || mongoose.model("booking", BookingSchema);

export default Booking;
