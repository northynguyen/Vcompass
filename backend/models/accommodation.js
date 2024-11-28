import mongoose from "mongoose";
import { RatingSchema } from "./rating.js";
const { Schema } = mongoose;

const RoomTypeSchema = new Schema({
  nameRoomType: { type: String, required: true },
  numBed: [
    {
      nameBed: { type: String, required: true },
      number: { type: Number, required: true }, // Ensure this is required
    },
  ],
  numPeople: {
    adult: { type: Number, required: true },
    child: { type: Number, required: true },
  },
  pricePerNight: { type: Number, required: true },
  images: [{ type: String }],
  status: { type: String, required: true },
  description: { type: String, required: true },
  amenities: [{ type: String }],
  roomSize: { type: Number, required: true },
});

const AccommodationSchema = new Schema({
  idPartner: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
  },
  price: { type: Number },
  city: { type: String, required: true },
  images: [{ type: String }],
  amenities: [{ type: String }],
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  note: { type: String },
  registerDate: { type: Date, default: Date.now },
  status: {
    type: String,
    required: true,
    enum: ['active', 'block', 'pending', 'unActive'],
    default: 'pending',
  },
  roomTypes: [RoomTypeSchema],
  ratings: [RatingSchema],
});

const Accommodation =
  mongoose.models.Accommodation ||
  mongoose.model("accommodation", AccommodationSchema);

export default Accommodation;
