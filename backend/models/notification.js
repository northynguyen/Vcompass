import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema({
  idSender: { type: String, required: true },
  idReceiver: { type: String, required: true },
  nameSender: { type: String, required: true },
  imgSender: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now },
});
const Notification =
  mongoose.models.Notification ||
  mongoose.model("notification", NotificationSchema);

export { Notification };
   