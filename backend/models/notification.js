import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema({
  idSender: { type: String, required: true },
  idReceiver: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Notification =
  mongoose.models.Notification ||
  mongoose.model("notification", NotificationSchema);

export { Notification };
   