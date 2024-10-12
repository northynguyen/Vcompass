import mongoose from "mongoose";
import { RatingSchema } from "./rating.js";
const { Schema } = mongoose;

const RoomTypeSchema = new Schema({
  idRoomType: { type: String, required: true },
  nameRoomType: { type: String, required: true },
  numBed: { type: Number, required: true },
  numPeople: { type: Number, required: true },
  numRoom: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
});

const AccommodationSchema = new Schema({
  idAccommodation: { type: String, required: true },
  idPartner: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  images: [{ type: String }],
  openTime: { type: String },
  closeTime: { type: String },
  note: { type: String },
  registerDate: { type: Date, default: Date.now },
  status: { type: String, required: true },
  roomTypes: [RoomTypeSchema],
  ratings: [RatingSchema],
});

const Accommodation =
  mongoose.models.Accommodation ||
  mongoose.model("accommodation", AccommodationSchema);

export default Accommodation;
