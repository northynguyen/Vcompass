import mongoose from "mongoose";
const { Schema } = mongoose;

const RatingSchema = new Schema({
  idRating: { type: String, required: true },
  idUser: { type: String, required: true },
  rate: { type: Number, required: true },
  content: { type: String, required: true },
  updateAt: { type: Date, default: Date.now },
});
export { RatingSchema };
