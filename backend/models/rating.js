import mongoose from "mongoose";
const { Schema } = mongoose;

const RatingSchema = new Schema({
  idUser: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // userName: { type: String, required: true },
  // userImage: { type: String, required: true },
  rate: { type: Number, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  roomRate : { type: Number },
  serviceRate : { type: Number },
  attractionRate : { type: Number },
  foodRate : { type: Number },
  duration : { type: Number },
  roomType : { type: String },
  numPeople : { type: String },
  response : { type: String },
  responseTime: {type: Date}
},{timestamps: true} );
export { RatingSchema };