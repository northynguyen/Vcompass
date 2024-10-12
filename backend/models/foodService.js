import { Schema } from "mongoose";
import { RatingSchema } from "./rating.js";

const FoodServiceSchema = new Schema({
  idFoodService: { type: String, required: true },
  idPartner: { type: String, required: true },
  serviceType: { type: String, required: true },
  foodServiceName: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  openTime: { type: String },
  closeTime: { type: String },
  registerDate: { type: Date, default: Date.now },
  status: { type: String, required: true },
  ratings: [RatingSchema],
});

const FoodService =
  mongoose.models.FoodService ||
  mongoose.model("foodservice", FoodServiceSchema);
export default FoodService;
