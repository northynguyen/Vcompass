import { Schema } from "mongoose";
import { RatingSchema } from "./rating.js";

const FoodServiceSchema = new Schema({
  idFoodService: { type: String, required: true },
  idPartner: { type: String, required: true },
  serviceType: { type: String, required: true },
  foodServiceName: { type: String, required: true },
  description: { type: String, required: true },
  location: { 
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
  },
  city: { type: String, required: true },
  price: { 
    maxPrice: { type: Number, required: true },
    minPrice: { type: Number, required: true },
   },
  images: [{ type: String }],
  registerDate: { type: Date, default: Date.now },
  status: { type: String, required: true },
  ratings: [RatingSchema],
  amenities: [{ type: String }],
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  menuImages: [{ type: String }],
  operatingHours: [
      {
          startDay: { type: String, required: true },
          endDay: { type: String, required: true },
          openTime: { type: String, required: true },
          closeTime: { type: String, required: true },
      }
  ],
});

const FoodService =
  mongoose.models.FoodService ||
  mongoose.model("foodservice", FoodServiceSchema);
export default FoodService;
