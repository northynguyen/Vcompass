import mongoose, { Schema } from "mongoose";

export const Message = new Schema({
  senderId: { type: String, required: true },
  content: { type: String },
  media: { type: String },
  mediaType: { type: String, enum: ["image", "video", "other"] },
  isReaded: {type: Boolean, required: true, default: false},
  createdAt: { type: Date, required: true, default: Date.now },
});

const ConversationSchema = new Schema({
  messages: [Message],
  participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
});

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("conversation", ConversationSchema);
export default Conversation;
