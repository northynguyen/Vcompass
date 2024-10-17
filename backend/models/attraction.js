import { Schema } from "mongoose";
import { RatingSchema } from "./rating.js";
import mongoose from "mongoose";
const AttractionSchema = new Schema({
  attraction_name: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  price: { type: Number, required: true },
  image: [{ type: String }],
  openTime: { type: String },
  closeTime: { type: String },
  rating: [RatingSchema],
  createdAt: { type: Date, default: Date.now },
});

const Attraction =
  mongoose.models.Attraction || mongoose.model("attraction", AttractionSchema);
export default Attraction;
