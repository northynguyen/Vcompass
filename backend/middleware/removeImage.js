import express from "express";
import path from "path";
import fs from "fs";

const deleteRouter = express.Router();

// Middleware để hỗ trợ phân tích dữ liệu JSON trong body
deleteRouter.use(express.json());

deleteRouter.delete("/", async (req, res) => {
  try {
    const { imagePath } = req.body; // Lấy imagePath từ body

    if (!imagePath) {
      return res.status(400).json({ success: false, message: "Đường dẫn ảnh không hợp lệ" });
    }

    // Tạo đường dẫn đầy đủ đến file ảnh bằng cách sử dụng import.meta.url
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const fullPath = path.join(__dirname, "..", "uploads", imagePath); // Điều chỉnh lại đường dẫn nếu cần thiết

    // Kiểm tra nếu file tồn tại
    try {
      // Sử dụng fs.promises.unlink để xóa file
      await fs.promises.unlink(fullPath);
      return res.json({ success: true, message: "Ảnh đã được xóa thành công" });
    } catch (error) {
      return res.status(404).json({ success: false, message: "Ảnh không tồn tại" });
    }
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
    return res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi xóa ảnh" });
  }
});

export default deleteRouter;
