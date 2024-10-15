import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema({
  idNotificaion: { type: String, required: true },
  idSender: { type: String, required: true },
  idReceiver: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Notification =
  mongoose.models.Notification ||
  mongoose.model("notificaion", NotificationSchema);

export { Notification };
