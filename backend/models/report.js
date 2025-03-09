// src/models/report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Liên kết với bảng User
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    targetType: {
        type: String,
        enum: ["Schedule", "Comment", "User", "Hotel", "Room", "Accommodation"], // Các loại đối tượng
        required: true,
    },
    reason: {
        type: String,
        enum: [
            "Inappropriate Content",   // Nội dung không phù hợp
            "False Information",      // Thông tin sai lệch
            "Spam or Ads",            // Spam, quảng cáo
            "Copyright Violation",    // Vi phạm bản quyền
            "Harassment",             // Quấy rối
            "Other",                  // Lý do khác
        ],
        required: true,
    },
    description: {
        type: String, // Mô tả chi tiết (nếu có)
        maxlength: 500,
    },
    status: {
        type: String,
        enum: ["pending", "rejected", "resolved"],
        default: "pending", // Mặc định là chưa xử lý
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Report", reportSchema);
