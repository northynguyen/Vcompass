// src/controllers/report.controller.js
import Report from "../models/report.js";
import mongoose from "mongoose";
import User from "../models/user.js";
// Tạo mới report
export const createReport = async (req, res) => {
    try {
        const { targetId, targetType, reason, description } = req.body;
        const reporterId = req.userId; // Lấy từ middleware xác thực
        const existingReport = await Report.findOne({ reporterId, targetId });
        if (existingReport) {
            return res.status(400).json({ message: "Bạn đã báo cáo nội dung này rồi!" });
        }
        const newReport = new Report({
            reporterId,
            targetId,
            targetType,
            reason,
            description,
        });

        await newReport.save();
        res.status(201).json({ message: "Report created successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error creating report", error });
    }
};

// Lấy danh sách báo cáo (chỉ admin)
export const getReports = async (req, res) => {
    try {
        const { status } = req.query;

        // Tạo điều kiện lọc nếu có status
        const filter = status && status !== "All" ? { status } : {};

        const reports = await Report.find(filter)
            .populate("reporterId", "name")
            .sort({ createdAt: -1 }); // Sắp xếp giảm dần theo thời gian

        res.status(200).json({
            success: true,
            reports,
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Error fetching reports", error });
    }
};



// Cập nhật trạng thái report
export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log("status", req.body);
        const updatedReport = await Report.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedReport) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.status(200).json(updatedReport);
    } catch (error) {
        res.status(500).json({ message: "Error updating report status", error });
    }
};
//Lấy report theo id
export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra id có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Kiểm tra id có phải là của người dùng (reporterId) không
        const user = await User.findById(id);
        if (user) {
            const reports = await Report.find({ reporterId: id })
                .populate("reporterId", "username")
                .sort({ createdAt: -1 }); // Sắp xếp theo thời gian giảm dần
            return res.status(200).json(reports);
        }

        // Nếu không phải userId, kiểm tra id của report
        const report = await Report.findById(id).populate("reporterId", "username");
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error("Error fetching report(s):", error);
        res.status(500).json({ message: "Error fetching report(s)", error });
    }
};