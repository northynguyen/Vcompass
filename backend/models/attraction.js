import { Schema } from "mongoose";
import { RatingSchema } from "./rating.js";
import mongoose from "mongoose";
const AttractionSchema = new Schema({
  attraction_name: { type: String, required: true },
  description: { type: String, required: true },
  location: { 
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
  },
  city: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  openTime: { type: String },
  closeTime: { type: String },
  amenities: [{ type: String }],
  rating: [RatingSchema],
  createdAt: { type: Date, default: Date.now },
});

const Attraction =
  mongoose.models.Attraction || mongoose.model("attraction", AttractionSchema);
export default Attraction;
