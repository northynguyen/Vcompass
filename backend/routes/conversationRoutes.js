import express from "express";
import {
  deleteConversation,
  deleteMessage,
  getConversationsByUser,
  sendMessage,
  addConversation,
  getConversationsTwoUserId,
  markMessagesAsRead
} from "../controllers/conversationController.js";

const router = express.Router();
router.get("/getConver/:senderId/:receiverId",getConversationsTwoUserId);
router.post("/mark-as-read", markMessagesAsRead);
router.post("/add", addConversation);
router.get("/:userId", getConversationsByUser);
router.post("/send", sendMessage);
router.delete("/:conversationId/message/:messageId", deleteMessage);
router.delete("/:conversationId", deleteConversation);

export default router;
