// src/routes/report.route.js
import express from "express";
import { createReport, getReports, updateReportStatus, getReportById } from "../controllers/reportController.js";
import authMiddleware, { verifyUser, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);
// Người dùng gửi report
router.post("/", verifyUser, createReport);

// Admin xem danh sách report
router.get("/", verifyAdmin, getReports);

// Admin cập nhật trạng thái report
router.patch("/:id", verifyAdmin, updateReportStatus);

router.get("/:id", verifyUser, getReportById);

export default router;
