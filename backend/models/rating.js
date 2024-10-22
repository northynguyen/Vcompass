import mongoose from "mongoose";
const { Schema } = mongoose;

const RatingSchema = new Schema({
  idUser: { type: String, required: true },
  rate: { type: Number, required: true },
  content: { type: String, required: true },
  updateAt: { type: Date, default: Date.now },
});
export { RatingSchema };
