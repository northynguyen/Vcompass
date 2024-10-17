import { Schema, model } from "mongoose";
import mongoose from "mongoose";


const UserSchema = new Schema({
  name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
  },
  email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // Removed unique: true to allow duplicate emails across roles
  },
  phone_number: {
      type: String,
      unique: true,
  },
  address: {
      type: String,
  },
  avatar: {
      type: String,
      required: true,
  },
  date_of_birth: {
      type: Date,
      required: true,
  },
  gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
  },
  
  password: {
      type: String,
      minlength: 8,
  },

  status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
  },
}, { timestamps: true });
const partnerModel = mongoose.models.Partner || model("partner", UserSchema);

export default partnerModel;
