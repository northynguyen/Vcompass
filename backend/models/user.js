import { Schema } from "mongoose";

const UserSchema = new Schema({
  idUser: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: password, required: true },
  userName: { type: String, required: true },
  avata: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.models.User || mongoose.model("user", UserSchema);

export default User;
