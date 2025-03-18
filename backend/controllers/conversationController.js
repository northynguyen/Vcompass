import Conversation from "../models/conversation.js";

export const addConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    let conversation = await Conversation.findOne({
      users: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = new Conversation({
        participantIds: [senderId, receiverId],
      });
      await conversation.save();
      conversation = await conversation.populate(
        "participantIds",
        "_id name avatar"
      );
    }
    res.status(200).json({ success: true, conversation });
    global.io.emit(`${receiverId}-newConversation`, conversation);
    global.io.emit(`${senderId}-newConversation`, conversation);
  } catch (error) {
    console.error("❌ Lỗi khi tạo conversation:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

export const getConversationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({
      $and: [
        { participantIds: userId },
        { participantIds: { $not: { $all: ["636861746169616969616969"] } } }, // Loại bỏ cuộc trò chuyện có chat-ai
      ],
    }).populate("participantIds", "_id name avatar");

    res.status(200).json(conversations);
  } catch (error) {
    console.error("🔥 Error fetching conversations:", error);

    res.status(500).json({
      message: "Lỗi khi lấy danh sách cuộc trò chuyện",
      error: error.message || error,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content, media, mediaType } = req.body;
    const newMessage = {
      senderId,
      content: content || "",
      media: media || null,
      mediaType: mediaType || null,
      createdAt: Date.now(),
    };

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $push: { messages: newMessage } },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    newMessage.conversationId = conversationId;
    global.io.to(conversationId).emit("newMessage", newMessage);
    res.status(200).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi gửi tin nhắn", error });
  }
};
export const getConversationsTwoUserId = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const conversation = await Conversation.findOne({
      participantIds: { $all: [senderId, receiverId] },
    }).populate("participantIds", "_id name avatar");
    if (conversation) {
      return res.status(200).json({ success: true, conversation });
    }
    res
      .status(404)
      .json({ success: false, message: "Không tìm thấy cuộc trò chuyện" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
export const deleteMessage = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa tin nhắn", error });
  }
};
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: { "messages.$[elem].isReaded": true },
      },
      {
        arrayFilters: [
          { "elem.senderId": { $ne: userId }, "elem.isReaded": false },
        ],
        new: true,
      }
    );
    res.status(200).json({
      message: "Tất cả tin nhắn đã được đánh dấu là đã đọc",
      updatedConversation,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật trạng thái tin nhắn", error });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: "Cuộc trò chuyện đã được xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa cuộc trò chuyện", error });
  }
};
