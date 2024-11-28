import express from "express";
import path from "path";
import fs from "fs";

const deleteRouter = express.Router();

// Middleware để hỗ trợ phân tích dữ liệu JSON trong body
deleteRouter.use(express.json());

deleteRouter.delete("/", async (req, res) => {
  try {
    const { imagePath } = req.body; // Lấy imagePath từ body
    console.log(imagePath);
    if (!imagePath) {
      return res.status(400).json({ success: false, message: "Đường dẫn ảnh không hợp lệ" });
    }

      try {
      // Sử dụng fs.promises.unlink để xóa file
      await fs.promises.unlink(`uploads/${imagePath}`);
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
