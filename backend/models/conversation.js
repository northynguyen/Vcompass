import { Schema } from "mongoose";

const LastMessageSchema = new Schema({
  lastMessage: { type: String, required: true },
  time: { type: Date, required: true },
});

const MessageSchema = new Schema({
  idMessage: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

const ConversationSchema = new Schema({
  idConversation: { type: String, required: true },
  lastMessage: LastMessageSchema,
  messages: [MessageSchema],
  participantIds: {
    idFirstUser: { type: String, required: true },
    idSecondUser: { type: String, required: true },
  },
});

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("conversation", ConversationSchema);
export default Conversation;
