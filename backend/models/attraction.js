import { Schema } from "mongoose";
import { RatingSchema } from "./rating.js";

const AttractionSchema = new Schema({
  idAttraction: { type: String, required: true },
  attractionName: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  openTime: { type: String },
  closeTime: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, required: true },
  ratings: [RatingSchema],
});

const Attraction =
  mongoose.models.Attraction || mongoose.model("attraction", AttractionSchema);
export default Attraction;
